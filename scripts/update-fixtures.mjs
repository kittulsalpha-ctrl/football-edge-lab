import { readFile, writeFile } from "node:fs/promises";

import {
  COMPETITIONS,
  DOMESTIC_COMPETITION_IDS,
  PUBLIC_COMPETITION_IDS,
  getCompetitionByApiCode,
  getLocalDateTimeParts,
  hasUsablePayload,
  makeInitials,
  normalizeCompetitionId,
  normalizeFixtureStatus,
} from "./competition-config.mjs";

const API_BASE = "https://api.football-data.org/v4";
const FIXTURES_FILE = "fixtures.live.json";
const STANDINGS_FILE = "standings.live.json";
const COMPETITIONS_FILE = "competitions.live.json";
const DISPLAY_TIME_ZONE = process.env.FIXTURE_TIME_ZONE || "Asia/Kolkata";
const FORM_LOOKBACK_DAYS = 320;
const MAX_FORM_MATCHES = 5;
const MAX_FETCH_RETRIES = 3;
const REQUEST_PAUSE_MS = Number(process.env.FOOTBALL_DATA_PAUSE_MS || 6500);
const SUPPORTED_COMPETITION_IDS = PUBLIC_COMPETITION_IDS;
const SOURCE_LABEL = "football-data.org";

const token = process.env.FOOTBALL_DATA_TOKEN;
if (!token) {
  throw new Error("Missing FOOTBALL_DATA_TOKEN secret. Add it in GitHub repository Settings > Secrets and variables > Actions.");
}

const startedAt = new Date();
const updatedAt = startedAt.toISOString();
const existingFixtures = await loadJson(FIXTURES_FILE, null);
const existingStandings = await loadJson(STANDINGS_FILE, null);
const existingCompetitions = await loadJson(COMPETITIONS_FILE, null);
const updateLog = [];
const teams = new Map();
const matchesByCompetition = new Map();
const standings = {};
const competitionMetadata = {};

for (const competitionId of SUPPORTED_COMPETITION_IDS) {
  const config = COMPETITIONS[competitionId];
  const season = getApiSeason(config);
  const competitionLog = { competitionId, status: "pending", messages: [] };
  updateLog.push(competitionLog);

  let competitionMatches = [];
  let competitionTeams = [];

  try {
    const [matchesPayload, teamsPayload] = await Promise.all([
      fetchFootballData(`${API_BASE}/competitions/${config.apiCode}/matches?season=${season}`),
      fetchFootballData(`${API_BASE}/competitions/${config.apiCode}/teams?season=${season}`),
    ]);

    competitionMatches = Array.isArray(matchesPayload?.matches)
      ? matchesPayload.matches.map((match, index) => convertMatch(match, index, teams)).filter(Boolean)
      : [];
    competitionTeams = Array.isArray(teamsPayload?.teams)
      ? teamsPayload.teams.map((team) => convertTeam(team, competitionId)).filter(Boolean)
      : [];

    competitionTeams.forEach((team) => mergeTeam(team, competitionId));
    if (!competitionMatches.length) {
      const fallbackMatches = getExistingMatchesForCompetition(existingFixtures, competitionId);
      if (fallbackMatches.length) {
        competitionMatches = fallbackMatches;
        fallbackMatches.forEach((match) => hydrateExistingTeams(match, existingFixtures, teams));
        competitionLog.messages.push("empty API response; preserved previous snapshot");
      }
    }
    matchesByCompetition.set(competitionId, competitionMatches);
    competitionLog.status = "ok";
    competitionLog.messages.push(`${competitionMatches.length} fixtures`, `${competitionTeams.length} teams`);
  } catch (error) {
    competitionLog.status = "failed";
    competitionLog.messages.push(error.message || "fixture/team request failed");
    const fallbackMatches = getExistingMatchesForCompetition(existingFixtures, competitionId);
    fallbackMatches.forEach((match) => {
      matchesByCompetition.set(competitionId, [...(matchesByCompetition.get(competitionId) || []), match]);
      hydrateExistingTeams(match, existingFixtures, teams);
    });
  }

  if (DOMESTIC_COMPETITION_IDS.includes(competitionId)) {
    standings[competitionId] = await loadStandingForCompetition(config, season, competitionLog);
  } else {
    standings[competitionId] = makeUnavailableStanding(config, "Standings are not published for this competition in GoalIQ.");
  }

  competitionMetadata[competitionId] = {
    id: config.id,
    name: config.name,
    shortName: config.shortName,
    season: config.season,
    type: config.type,
    apiCode: config.apiCode,
    source: SOURCE_LABEL,
    updatedAt,
    teams: getTeamsForCompetition(competitionId, teams, competitionTeams),
    status: competitionLog.status,
    message: competitionLog.messages.join("; "),
  };

  await delay(REQUEST_PAUSE_MS);
}

const allMatches = [...matchesByCompetition.values()].flat().sort(sortMatches);
if (!hasUsablePayload({ matches: allMatches }) && hasUsablePayload(existingFixtures)) {
  console.log("No usable fixture payload returned; preserving existing fixtures.live.json.");
} else {
  await applyRecentTeamForms(teams);
  const fixtureFeed = buildFixtureFeed(allMatches, teams, updatedAt, updateLog);
  await writeJson(FIXTURES_FILE, fixtureFeed);
  console.log(`Wrote ${fixtureFeed.matches.length} fixtures and ${fixtureFeed.teams.length} teams to ${FIXTURES_FILE}.`);
}

const standingsFeed = buildStandingsFeed(standings, updatedAt, updateLog);
await writeJson(STANDINGS_FILE, standingsFeed);
console.log(`Wrote standings metadata for ${Object.keys(standingsFeed.standings).length} competitions to ${STANDINGS_FILE}.`);

const competitionFeed = buildCompetitionsFeed(competitionMetadata, updatedAt, updateLog);
await writeJson(COMPETITIONS_FILE, competitionFeed);
console.log(`Wrote competition metadata for ${Object.keys(competitionFeed.competitions).length} competitions to ${COMPETITIONS_FILE}.`);

console.log(
  updateLog
    .map((entry) => `${entry.competitionId}: ${entry.status} (${entry.messages.join("; ") || "no details"})`)
    .join("\n")
);

async function loadStandingForCompetition(config, season, competitionLog) {
  try {
    const payload = await fetchFootballData(`${API_BASE}/competitions/${config.apiCode}/standings?season=${season}`);
    const table = payload?.standings?.find((standing) => Array.isArray(standing.table))?.table || [];
    if (!table.length) {
      competitionLog.messages.push("no standings rows");
      return getExistingStanding(config.id) || makeUnavailableStanding(config);
    }

    return {
      competitionId: config.id,
      season: config.season,
      source: SOURCE_LABEL,
      updatedAt,
      message: "Official league table from football-data.org.",
      table: table.map((row) => convertStandingRow(row, config.id)),
    };
  } catch (error) {
    competitionLog.messages.push(`standings unavailable: ${error.message || "request failed"}`);
    return getExistingStanding(config.id) || makeUnavailableStanding(config);
  }
}

async function applyRecentTeamForms(teamMap) {
  const eligibleTeams = [...teamMap.values()].filter((team) => team.externalId);
  const from = formatDateKey(addDays(new Date(), -FORM_LOOKBACK_DAYS));
  const to = formatDateKey(new Date());

  for (const team of eligibleTeams) {
    try {
      const payload = await fetchFootballData(`${API_BASE}/teams/${team.externalId}/matches?status=FINISHED&dateFrom=${from}&dateTo=${to}`);
      const recent = Array.isArray(payload?.matches) ? payload.matches : [];
      team.form = buildTeamForm(team, recent);
      const profile = buildTeamProfileFromForm(team.form, team.rating);
      team.statsAvailable = Boolean(profile);
      if (profile) {
        team.rating = profile.rating;
        team.attacking = profile.attacking;
        team.defensive = profile.defensive;
      }
    } catch (error) {
      team.form = [];
      team.statsAvailable = false;
      console.log(`Form unavailable for ${team.name}: ${error.message || "request failed"}`);
    }
    await delay(REQUEST_PAUSE_MS);
  }
}

function buildTeamForm(team, rawMatches) {
  return rawMatches
    .filter((match) => normalizeFixtureStatus(match.status) === "finished" && normalizeScore(match.score))
    .sort((a, b) => String(b.utcDate || "").localeCompare(String(a.utcDate || "")))
    .map((match) => convertFormMatch(team, match))
    .filter(Boolean)
    .filter((row) => isFormAllowedForTeam(team, row))
    .slice(0, MAX_FORM_MATCHES);
}

function convertFormMatch(team, match) {
  const score = normalizeScore(match.score);
  if (!score) return null;

  const homeId = match.homeTeam?.id ? `FD${match.homeTeam.id}` : "";
  const awayId = match.awayTeam?.id ? `FD${match.awayTeam.id}` : "";
  const isHome = team.id === homeId || String(team.externalId) === String(match.homeTeam?.id);
  const isAway = team.id === awayId || String(team.externalId) === String(match.awayTeam?.id);
  if (!isHome && !isAway) return null;

  const competition = normalizeCompetitionId(match.competition?.code || match.competition?.name || "");
  return {
    date: formatApiDate(match.utcDate),
    competition,
    opponent: isHome ? cleanTeamName(match.awayTeam) : cleanTeamName(match.homeTeam),
    venue: isHome ? "H" : "A",
    goalsFor: isHome ? score.home : score.away,
    goalsAgainst: isHome ? score.away : score.home,
  };
}

function isFormAllowedForTeam(team, row) {
  const teamCompetitions = new Set((team.competitionIds || [team.league]).filter(Boolean));
  const competition = normalizeCompetitionId(row.competition);
  if (teamCompetitions.has("WC")) {
    return !DOMESTIC_COMPETITION_IDS.includes(competition);
  }
  if (competition === "WC") return false;
  return true;
}

function convertMatch(match, index, teamMap) {
  const competition = getCompetitionByApiCode(match.competition?.code) || COMPETITIONS[normalizeCompetitionId(match.competition?.name)];
  if (!competition || !SUPPORTED_COMPETITION_IDS.includes(competition.id)) return null;

  const homeTeam = convertTeam(match.homeTeam, competition.id);
  const awayTeam = convertTeam(match.awayTeam, competition.id);
  if (!homeTeam || !awayTeam || homeTeam.id === awayTeam.id) return null;

  mergeTeam(homeTeam, competition.id, teamMap);
  mergeTeam(awayTeam, competition.id, teamMap);

  const local = match.utcDate ? getLocalDateTimeParts(match.utcDate, DISPLAY_TIME_ZONE) : null;
  const date = local?.date || formatDateKey(new Date());
  const time = local?.time || "00:00";
  const score = normalizeScore(match.score);
  const status = normalizeFixtureStatus(match.status, { hasScore: Boolean(score), date, today: formatDateKey(new Date()) });
  const id = `fd-${match.id || `${competition.id}-${homeTeam.id}-${awayTeam.id}-${index}`}`.toLowerCase();

  return {
    id,
    externalId: String(match.id || ""),
    competitionId: competition.id,
    league: competition.id,
    season: competition.season,
    matchday: match.matchday || null,
    stage: formatStage(match),
    date,
    utcDate: match.utcDate || "",
    time,
    kickoff: match.utcDate || `${date}T${time}:00`,
    status,
    minute: Number(match.minute) || null,
    homeTeamId: homeTeam.id,
    homeTeam: homeTeam.name,
    homeCrest: homeTeam.crest,
    awayTeamId: awayTeam.id,
    awayTeam: awayTeam.name,
    awayCrest: awayTeam.crest,
    homeScore: score?.home ?? null,
    awayScore: score?.away ?? null,
    halftimeHomeScore: normalizeHalfScore(match.score)?.home ?? null,
    halftimeAwayScore: normalizeHalfScore(match.score)?.away ?? null,
    venue: match.venue || "",
    referee: Array.isArray(match.referees) ? match.referees.map((referee) => referee.name).filter(Boolean).join(", ") : "",
    source: SOURCE_LABEL,
    updatedAt,
    score,
  };
}

function convertTeam(team, competitionId) {
  const name = cleanTeamName(team);
  if (!name) return null;
  const shortName = String(team?.tla || team?.shortName || makeInitials(name)).slice(0, 4).toUpperCase();
  return {
    id: team?.id ? `FD${team.id}` : createTeamId(name, competitionId),
    externalId: team?.id ? String(team.id) : "",
    name,
    shortName,
    code: String(team?.tla || shortName).slice(0, 4).toUpperCase(),
    crest: team?.crest || "",
    country: team?.area?.name || team?.country || "",
    competitionIds: [competitionId],
    league: competitionId,
    venue: team?.venue || "",
    rating: 1600,
    source: SOURCE_LABEL,
    statsAvailable: false,
    attacking: makeDefaultAttacking(),
    defensive: makeDefaultDefensive(),
    form: [],
  };
}

function mergeTeam(team, competitionId, teamMap = teams) {
  const existing = teamMap.get(team.id);
  if (!existing) {
    teamMap.set(team.id, team);
    return team;
  }
  const merged = {
    ...existing,
    ...team,
    competitionIds: [...new Set([...(existing.competitionIds || []), ...(team.competitionIds || []), competitionId].filter(Boolean))],
    form: existing.form?.length ? existing.form : team.form || [],
    statsAvailable: existing.statsAvailable || team.statsAvailable,
  };
  teamMap.set(team.id, merged);
  return merged;
}

function convertStandingRow(row, competitionId) {
  const team = convertTeam(row.team, competitionId) || {
    id: row.team?.id ? `FD${row.team.id}` : createTeamId(row.team?.name || "Team", competitionId),
    name: row.team?.name || "Team",
    shortName: makeInitials(row.team?.name || "Team"),
    crest: row.team?.crest || "",
  };
  if (team.name) mergeTeam(team, competitionId);
  return {
    position: Number(row.position || 0),
    teamId: team.id,
    teamName: team.name,
    shortName: team.shortName,
    crest: team.crest || "",
    played: Number(row.playedGames || row.played || 0),
    won: Number(row.won || 0),
    drawn: Number(row.draw || row.drawn || 0),
    lost: Number(row.lost || 0),
    goalsFor: Number(row.goalsFor || 0),
    goalsAgainst: Number(row.goalsAgainst || 0),
    goalDifference: Number(row.goalDifference || 0),
    points: Number(row.points || 0),
    form: parseStandingForm(row.form),
  };
}

function parseStandingForm(value) {
  if (Array.isArray(value)) return value.slice(-5).map((entry) => String(entry).slice(0, 1).toUpperCase());
  return String(value || "")
    .split(/[,\s]+/)
    .filter(Boolean)
    .map((entry) => entry.slice(0, 1).toUpperCase())
    .slice(-5);
}

function getTeamsForCompetition(competitionId, teamMap, endpointTeams = []) {
  const endpointTeamIds = new Set(endpointTeams.map((team) => team.id));
  return [...teamMap.values()]
    .filter((team) => endpointTeamIds.has(team.id) || team.competitionIds?.includes(competitionId))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(exportTeamMetadata);
}

function exportTeamMetadata(team) {
  return {
    id: team.id,
    externalId: team.externalId || "",
    name: team.name,
    shortName: team.shortName,
    code: team.code || team.shortName || "",
    crest: team.crest || "",
    country: team.country || "",
    competitionIds: team.competitionIds || [],
    venue: team.venue || "",
    source: team.source || SOURCE_LABEL,
  };
}

function buildFixtureFeed(fixtureMatches, teamMap, updatedAtValue, log) {
  const usedTeamIds = new Set(fixtureMatches.flatMap((match) => [match.homeTeamId, match.awayTeamId]).filter(Boolean));
  return {
    meta: {
      source: `${SOURCE_LABEL} live feed`,
      season: "2026/27",
      updatedAt: updatedAtValue,
      competitions: SUPPORTED_COMPETITION_IDS,
      timeZone: DISPLAY_TIME_ZONE,
      note: `Real fixtures and scores where available. Times shown in ${DISPLAY_TIME_ZONE}.`,
      log,
    },
    teams: [...teamMap.values()]
      .filter((team) => usedTeamIds.has(team.id))
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(exportTeam),
    matches: fixtureMatches.sort(sortMatches),
  };
}

function exportTeam(team) {
  return {
    id: team.id,
    externalId: team.externalId || "",
    name: team.name,
    shortName: team.shortName,
    code: team.code || team.shortName || "",
    crest: team.crest || "",
    country: team.country || "",
    competitionIds: team.competitionIds || [team.league].filter(Boolean),
    league: team.league || team.competitionIds?.[0] || "",
    rating: team.rating || 1600,
    venue: team.venue || "",
    source: team.source || SOURCE_LABEL,
    statsAvailable: Boolean(team.statsAvailable),
    attacking: team.attacking || makeDefaultAttacking(),
    defensive: team.defensive || makeDefaultDefensive(),
    form: Array.isArray(team.form) ? team.form.slice(0, MAX_FORM_MATCHES) : [],
  };
}

function buildStandingsFeed(standingMap, updatedAtValue, log) {
  return {
    meta: {
      source: SOURCE_LABEL,
      season: "2026/27",
      updatedAt: updatedAtValue,
      competitions: DOMESTIC_COMPETITION_IDS,
      note: "The 2026/27 league table will appear when official competition data becomes available.",
      log,
    },
    standings: standingMap,
  };
}

function buildCompetitionsFeed(competitionMap, updatedAtValue, log) {
  return {
    meta: {
      source: SOURCE_LABEL,
      season: "2026/27",
      updatedAt: updatedAtValue,
      competitions: SUPPORTED_COMPETITION_IDS,
      log,
    },
    competitions: competitionMap,
  };
}

function getExistingStanding(competitionId) {
  const standing = existingStandings?.standings?.[competitionId];
  return standing && Array.isArray(standing.table) ? standing : null;
}

function makeUnavailableStanding(config, message = "The 2026/27 league table will appear when official competition data becomes available.") {
  return {
    competitionId: config.id,
    season: config.season,
    source: SOURCE_LABEL,
    updatedAt: existingStandings?.standings?.[config.id]?.updatedAt || "",
    message,
    table: [],
  };
}

function getExistingMatchesForCompetition(feed, competitionId) {
  const matches = Array.isArray(feed?.matches) ? feed.matches : [];
  return matches.filter((match) => normalizeCompetitionId(match.competitionId || match.league || match.competition) === competitionId);
}

function hydrateExistingTeams(match, feed, teamMap) {
  const feedTeams = new Map((feed?.teams || []).map((team) => [team.id, team]));
  [match.homeTeamId, match.awayTeamId].forEach((teamId) => {
    const team = feedTeams.get(teamId);
    if (team) mergeTeam({ ...team, competitionIds: team.competitionIds || [match.league].filter(Boolean) }, match.league, teamMap);
  });
}

async function fetchFootballData(url) {
  for (let attempt = 0; attempt <= MAX_FETCH_RETRIES; attempt += 1) {
    const response = await fetch(url, {
      headers: {
        "X-Auth-Token": token,
      },
    });

    let payload = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    if (response.ok) return payload;

    const message = payload?.message || payload?.error || `HTTP ${response.status}`;
    const retryDelayMs = getRetryDelayMs(response, message);
    if (retryDelayMs && attempt < MAX_FETCH_RETRIES) {
      console.log(`football-data.org rate limit hit; retrying in ${Math.round(retryDelayMs / 1000)}s.`);
      await delay(retryDelayMs);
      continue;
    }

    throw new Error(`football-data.org request failed: ${message}`);
  }

  throw new Error("football-data.org request failed after retries.");
}

function getRetryDelayMs(response, message) {
  if (response.status !== 429 && !/request limit/i.test(message)) return 0;
  const retryAfter = Number(response.headers.get("retry-after"));
  if (Number.isFinite(retryAfter) && retryAfter > 0) return (retryAfter + 2) * 1000;
  const waitMatch = String(message).match(/wait\s+(\d+)\s+seconds/i);
  if (waitMatch) return (Number(waitMatch[1]) + 2) * 1000;
  return 35000;
}

function normalizeScore(score) {
  if (!score || typeof score !== "object") return null;
  const candidates = [score.fullTime, score.regularTime, score.extraTime, score.penalties, score];
  for (const candidate of candidates) {
    const home = Number(candidate?.home ?? candidate?.homeTeam);
    const away = Number(candidate?.away ?? candidate?.awayTeam);
    if (Number.isFinite(home) && Number.isFinite(away)) return { home, away };
  }
  return null;
}

function normalizeHalfScore(score) {
  const half = score?.halfTime || score?.halftime;
  const home = Number(half?.home ?? half?.homeTeam);
  const away = Number(half?.away ?? half?.awayTeam);
  if (!Number.isFinite(home) || !Number.isFinite(away)) return null;
  return { home, away };
}

function formatStage(match) {
  return String(match.stage || match.group || (match.matchday ? `Matchweek ${match.matchday}` : "") || "")
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function cleanTeamName(team) {
  return String(team?.shortName || team?.name || "").trim();
}

function createTeamId(name, competitionId) {
  const stem = String(name || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 10);
  return `${competitionId}_${stem || "TEAM"}`;
}

function buildTeamProfileFromForm(form, seedRating = 1600) {
  const recent = Array.isArray(form)
    ? form.filter((match) => Number.isFinite(Number(match.goalsFor)) && Number.isFinite(Number(match.goalsAgainst)))
    : [];
  if (!recent.length) return null;

  const totals = recent.reduce(
    (summary, match) => {
      const goalsFor = Number(match.goalsFor);
      const goalsAgainst = Number(match.goalsAgainst);
      summary.goalsFor += goalsFor;
      summary.goalsAgainst += goalsAgainst;
      summary.cleanSheets += goalsAgainst === 0 ? 1 : 0;
      summary.failedToScore += goalsFor === 0 ? 1 : 0;
      summary.points += goalsFor > goalsAgainst ? 3 : goalsFor === goalsAgainst ? 1 : 0;
      return summary;
    },
    { goalsFor: 0, goalsAgainst: 0, cleanSheets: 0, failedToScore: 0, points: 0 }
  );

  const matchesPlayed = recent.length;
  const avgGoals = totals.goalsFor / matchesPlayed;
  const avgAgainst = totals.goalsAgainst / matchesPlayed;
  const pointsPerMatch = totals.points / matchesPlayed;
  const goalDifferencePerMatch = (totals.goalsFor - totals.goalsAgainst) / matchesPlayed;
  const cleanSheetPct = (totals.cleanSheets / matchesPlayed) * 100;
  const failedToScorePct = (totals.failedToScore / matchesPlayed) * 100;
  const ratingBase = Number.isFinite(Number(seedRating)) ? Number(seedRating) : 1600;

  return {
    rating: Math.round(clamp(ratingBase + (pointsPerMatch - 1.35) * 95 + goalDifferencePerMatch * 70 + (cleanSheetPct - 30) * 1.1, 1380, 2025)),
    attacking: {
      avgGoals: roundMetric(avgGoals),
      shots: roundMetric(clamp(8.2 + avgGoals * 3.1 + pointsPerMatch * 0.9 - failedToScorePct * 0.018, 6.8, 19.5), 1),
      shotsOnTarget: roundMetric(clamp(2.4 + avgGoals * 1.35 + pointsPerMatch * 0.22, 1.8, 7.4), 1),
      bigChances: roundMetric(clamp(0.65 + avgGoals * 0.85 + pointsPerMatch * 0.18, 0.3, 4.2), 1),
      xg: roundMetric(clamp(avgGoals * 0.82 + pointsPerMatch * 0.18 + 0.28, 0.45, 3.05)),
    },
    defensive: {
      goalsConcededAvg: roundMetric(avgAgainst),
      cleanSheetPct: Math.round(cleanSheetPct),
      xga: roundMetric(clamp(avgAgainst * 0.88 + (100 - cleanSheetPct) * 0.004, 0.35, 2.85)),
      cards: roundMetric(clamp(2.45 - pointsPerMatch * 0.2 + avgAgainst * 0.14, 1.3, 3.4), 1),
    },
  };
}

function makeDefaultAttacking() {
  return { avgGoals: 1.25, shots: 0, shotsOnTarget: 0, bigChances: 0, xg: 1.18 };
}

function makeDefaultDefensive() {
  return { goalsConcededAvg: 1.38, cleanSheetPct: 0, xga: 1.42, cards: 0 };
}

function roundMetric(value, digits = 2) {
  return Number(value.toFixed(digits));
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function formatApiDate(value) {
  const local = value ? getLocalDateTimeParts(value, DISPLAY_TIME_ZONE) : null;
  return local?.date || formatDateKey(new Date());
}

function getApiSeason(config) {
  return config.season.includes("/") ? config.season.split("/")[0] : config.season;
}

function formatDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function addDays(date, days) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function sortMatches(a, b) {
  return String(a.date || "").localeCompare(String(b.date || "")) || String(a.time || "").localeCompare(String(b.time || ""));
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function loadJson(path, fallback) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch {
    return fallback;
  }
}

async function writeJson(path, payload) {
  await writeFile(path, `${JSON.stringify(payload, null, 2)}\n`);
}
