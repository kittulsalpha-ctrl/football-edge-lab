import { readFile, writeFile } from "node:fs/promises";

const API_BASE = "https://api.football-data.org/v4";
const COMPETITIONS = ["PL", "PD", "SA", "FL1", "CL", "EL"];
const OUT_FILE = "fixtures.live.json";
const DISPLAY_TIME_ZONE = process.env.FIXTURE_TIME_ZONE || "Asia/Kolkata";
const MAX_WINDOW_DAYS = 10;
const FORM_LOOKBACK_DAYS = 220;
const MAX_FORM_MATCHES = 5;
const MAX_FETCH_RETRIES = 3;
const REQUEST_PAUSE_MS = 1500;

const token = process.env.FOOTBALL_DATA_TOKEN;
if (!token) {
  throw new Error("Missing FOOTBALL_DATA_TOKEN secret.");
}

const fromDate = addDays(new Date(), -1);
const toDate = addDays(new Date(), 60);

const from = formatDateKey(fromDate);
const to = formatDateKey(toDate);
const formFromDate = addDays(new Date(), -FORM_LOOKBACK_DAYS);
const formToDate = new Date();

const apiMatches = await fetchMatchesInWindows(fromDate, toDate);
const apiFormMatches = await fetchMatchesInWindows(formFromDate, formToDate, { status: "FINISHED" });

const existingFeed = await loadExistingFeed();
const converted = convertFootballData({ matches: apiMatches, formMatches: apiFormMatches }, from, to, existingFeed);
if (!converted) {
  console.log("football-data.org returned no supported fixtures for the configured date range; skipping update.");
  process.exit(0);
}

await writeFile(OUT_FILE, `${JSON.stringify(converted, null, 2)}\n`);
console.log(`Wrote ${converted.matches.length} fixtures to ${OUT_FILE}.`);

async function fetchMatchesInWindows(fromDate, toDate, extraParams = {}) {
  const matches = [];

  for (const competition of COMPETITIONS) {
    let start = fromDate;

    while (start <= toDate) {
      const windowEnd = addDays(start, MAX_WINDOW_DAYS - 1);
      const end = windowEnd > toDate ? toDate : windowEnd;

      const params = new URLSearchParams({
        competitions: competition,
        dateFrom: formatDateKey(start),
        dateTo: formatDateKey(end),
        ...extraParams,
      });

      try {
        const payload = await fetchFootballData(`${API_BASE}/matches?${params.toString()}`);
        const windowMatches = Array.isArray(payload?.matches) ? payload.matches : [];
        matches.push(...windowMatches);
      } catch (error) {
        if (isCompetitionUnavailable(error)) {
          console.log(`Skipping ${competition}: ${error.message}`);
          break;
        }
        throw error;
      }

      start = addDays(end, 1);
      await delay(REQUEST_PAUSE_MS);
    }
  }

  return matches;
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

    throw new Error(`football-data.org request failed (${response.status}): ${message}`);
  }

  throw new Error("football-data.org request failed after retries.");
}

function isCompetitionUnavailable(error) {
  return /football-data\.org request failed \((403|404)\)|restricted resource|not found|subscription|plan/i.test(
    String(error?.message || "")
  );
}

function getRetryDelayMs(response, message) {
  if (response.status !== 429 && !/request limit/i.test(message)) return 0;

  const retryAfter = Number(response.headers.get("retry-after"));
  if (Number.isFinite(retryAfter) && retryAfter > 0) return (retryAfter + 2) * 1000;

  const waitMatch = String(message).match(/wait\s+(\d+)\s+seconds/i);
  if (waitMatch) return (Number(waitMatch[1]) + 2) * 1000;

  return 35000;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function loadExistingFeed() {
  try {
    return JSON.parse(await readFile(OUT_FILE, "utf8"));
  } catch {
    return null;
  }
}

function convertFootballData(payload, fromDate, toDate, existingFeed) {
  const apiMatches = Array.isArray(payload?.matches) ? payload.matches : [];
  const apiFormMatches = Array.isArray(payload?.formMatches) ? payload.formMatches : [];

  const teams = new Map();
  const existingTeams = new Map((existingFeed?.teams || []).map((team) => [team.id, team]));

  const matches = apiMatches
    .map((match, index) => convertMatch(match, index, teams))
    .filter(Boolean)
    .sort(sortMatches);

  const mergedMatches = mergeRecentFinishedMatches(
    matches,
    existingFeed?.matches || [],
    fromDate,
    teams,
    existingTeams
  );

  if (!mergedMatches.length) {
    return null;
  }

  applyTeamForms(teams, [...apiFormMatches, ...apiMatches]);
  applyTeamProfiles(teams);
  const historicalMatches = apiFormMatches
    .map((match, index) => convertHistoricalMatch(match, index))
    .filter(Boolean)
    .sort(sortMatches);

  return {
    meta: {
      source: "football-data.org live feed",
      updatedAt: new Date().toISOString().slice(0, 10),
      note: `Real fixtures and scores for Premier League, La Liga, Serie A, Ligue 1, UEFA Champions League, and UEFA Europa League from ${fromDate} to ${toDate}.
Times shown in ${DISPLAY_TIME_ZONE}.`,
    },
    teams: [...teams.values()].sort((a, b) => a.name.localeCompare(b.name)),
    historicalMatches,
    matches: mergedMatches,
  };
}

function mergeRecentFinishedMatches(newMatches, oldMatches, fromDate, teams, existingTeams) {
  const merged = new Map(newMatches.map((match) => [match.id, match]));

  oldMatches
    .filter((match) => isSupportedLeague(match.league) && match.status === "finished" && match.date >= fromDate)
    .forEach((match) => {
      if (merged.has(match.id)) return;
      merged.set(match.id, match);

      [match.homeTeamId, match.awayTeamId].forEach((teamId) => {
        const team = existingTeams.get(teamId);
        if (team) teams.set(team.id, team);
      });
    });

  return [...merged.values()].sort(sortMatches);
}

function isSupportedLeague(league) {
  return ["EPL", "LALIGA", "SERIEA", "LIGUE1", "UCL", "UEL"].includes(league);
}

function convertMatch(match, index, teams) {
  const league = normalizeLeague(match.competition?.code || match.competition?.name);
  if (!league) return null;

  const homeTeam = convertTeam(match.homeTeam, league);
  const awayTeam = convertTeam(match.awayTeam, league);
  if (!homeTeam || !awayTeam || homeTeam.id === awayTeam.id) return null;

  teams.set(homeTeam.id, homeTeam);
  teams.set(awayTeam.id, awayTeam);

  const kickoff = match.utcDate ? new Date(match.utcDate) : null;
  const hasKickoff = kickoff && !Number.isNaN(kickoff.getTime());

  const id = `fd-${match.id || `${league}-${homeTeam.id}-${awayTeam.id}-${index}`}`;

  return {
    id,
    league,
    date: hasKickoff ? formatDateInTimeZone(kickoff) : formatDateInTimeZone(new Date()),
    time: hasKickoff ? formatClockTimeInTimeZone(kickoff) : "00:00",
    homeTeamId: homeTeam.id,
    awayTeamId: awayTeam.id,
    homeTeam: homeTeam.name,
    awayTeam: awayTeam.name,
    status: normalizeStatus(match.status),
    venue: match.venue || "",
    stage: formatStage(match),
    score: normalizeScore(match.score),
  };
}

function convertTeam(team, league) {
  const name = String(team?.shortName || team?.name || "").trim();
  if (!name) return null;

  return {
    id: team?.id ? `FD${team.id}` : createTeamId(name, league),
    name,
    shortName: String(team?.tla || makeShortName(name)).slice(0, 4).toUpperCase(),
    rating: 1600,
    venue: "",
    league,
    attacking: {
      avgGoals: null,
      shots: null,
      shotsOnTarget: null,
      bigChances: null,
      xg: null,
      expectedGoalsModel: null,
    },
    defensive: {
      goalsConcededAvg: null,
      cleanSheetPct: null,
      xga: null,
      cards: null,
      expectedGoalsAgainstModel: null,
    },
    dataProvenance: createUnavailableTeamProvenance(league),
    form: [],
  };
}

function convertHistoricalMatch(match, index) {
  const league = normalizeLeague(match.competition?.code || match.competition?.name);
  if (!league) return null;

  const homeTeam = convertTeam(match.homeTeam, league);
  const awayTeam = convertTeam(match.awayTeam, league);
  const score = normalizeScore(match.score);
  if (!homeTeam || !awayTeam || !score) return null;

  const kickoff = match.utcDate ? new Date(match.utcDate) : null;
  const hasKickoff = kickoff && !Number.isNaN(kickoff.getTime());

  return {
    id: `fd-history-${match.id || `${league}-${homeTeam.id}-${awayTeam.id}-${index}`}`,
    competitionId: league,
    league,
    season: match.season?.id || match.season?.startDate || "",
    date: hasKickoff ? formatDateInTimeZone(kickoff) : formatDateKey(new Date()),
    time: hasKickoff ? formatClockTimeInTimeZone(kickoff) : "00:00",
    kickoff: hasKickoff ? kickoff.toISOString() : "",
    homeTeamId: homeTeam.id,
    awayTeamId: awayTeam.id,
    homeTeam: homeTeam.name,
    awayTeam: awayTeam.name,
    homeGoals: score.home,
    awayGoals: score.away,
    halftimeHomeGoals: null,
    halftimeAwayGoals: null,
    homeShots: null,
    awayShots: null,
    homeShotsOnTarget: null,
    awayShotsOnTarget: null,
    homeXg: null,
    awayXg: null,
    source: "football-data.org",
    sourceQuality: {
      fixture: "provider",
      score: "provider",
      advancedStats: "unavailable",
    },
  };
}

function applyTeamForms(teams, apiMatches) {
  const teamForms = new Map([...teams.keys()].map((teamId) => [teamId, []]));
  const seen = new Set();
  const sortedMatches = apiMatches
    .filter((match) => normalizeStatus(match.status) === "finished" && normalizeScore(match.score))
    .sort((a, b) => String(b.utcDate || "").localeCompare(String(a.utcDate || "")));

  sortedMatches.forEach((match) => {
    const league = normalizeLeague(match.competition?.code || match.competition?.name);
    if (!league) return;

    const homeTeam = convertTeam(match.homeTeam, league);
    const awayTeam = convertTeam(match.awayTeam, league);
    const score = normalizeScore(match.score);
    if (!homeTeam || !awayTeam || !score) return;

    appendFormMatch(teamForms, teams, seen, homeTeam.id, match.id, {
      date: formatApiMatchDate(match),
      competition: league,
      opponent: awayTeam.name,
      venue: "H",
      goalsFor: score.home,
      goalsAgainst: score.away,
    });

    appendFormMatch(teamForms, teams, seen, awayTeam.id, match.id, {
      date: formatApiMatchDate(match),
      competition: league,
      opponent: homeTeam.name,
      venue: "A",
      goalsFor: score.away,
      goalsAgainst: score.home,
    });
  });

  teams.forEach((team) => {
    team.form = teamForms.get(team.id) || [];
  });
}

function appendFormMatch(teamForms, teams, seen, teamId, matchId, formMatch) {
  const team = teams.get(teamId);
  const form = teamForms.get(teamId);
  if (!team || !form || form.length >= MAX_FORM_MATCHES) return;
  const key = `${teamId}:${matchId || `${formMatch.date}:${formMatch.opponent}`}`;
  if (seen.has(key)) return;
  seen.add(key);
  form.push(formMatch);
}

function formatApiMatchDate(match) {
  const date = match.utcDate ? new Date(match.utcDate) : null;
  if (date && !Number.isNaN(date.getTime())) return formatDateInTimeZone(date);
  return formatDateKey(new Date());
}

function applyTeamProfiles(teams) {
  teams.forEach((team) => {
    const profile = buildTeamProfileFromForm(team.form, team.rating);
    if (!profile) {
      team.attacking = {
        avgGoals: null,
        shots: null,
        shotsOnTarget: null,
        bigChances: null,
        xg: null,
        expectedGoalsModel: null,
      };
      team.defensive = {
        goalsConcededAvg: null,
        cleanSheetPct: null,
        xga: null,
        cards: null,
        expectedGoalsAgainstModel: null,
      };
      team.dataProvenance = createUnavailableTeamProvenance(team.league);
      return;
    }

    team.rating = profile.rating;
    team.attacking = profile.attacking;
    team.defensive = profile.defensive;
    team.dataProvenance = profile.dataProvenance;
  });
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
  const ratingBase = Number.isFinite(Number(seedRating)) ? Number(seedRating) : 1600;

  return {
    rating: Math.round(clamp(ratingBase + (pointsPerMatch - 1.35) * 95 + goalDifferencePerMatch * 70 + (cleanSheetPct - 30) * 1.1, 1380, 2025)),
    attacking: {
      avgGoals: roundMetric(avgGoals),
      shots: null,
      shotsOnTarget: null,
      bigChances: null,
      xg: null,
      expectedGoalsModel: null,
    },
    defensive: {
      goalsConcededAvg: roundMetric(avgAgainst),
      cleanSheetPct: Math.round(cleanSheetPct),
      xga: null,
      cards: null,
      expectedGoalsAgainstModel: null,
    },
    dataProvenance: createDerivedTeamProvenance(),
  };
}

function createUnavailableTeamProvenance(league) {
  return {
    source: "football-data.org",
    league,
    attacking: {
      avgGoals: unavailableProvenance(),
      shots: unavailableProvenance(),
      shotsOnTarget: unavailableProvenance(),
      bigChances: unavailableProvenance(),
      xg: unavailableProvenance(),
    },
    defensive: {
      goalsConcededAvg: unavailableProvenance(),
      cleanSheetPct: unavailableProvenance(),
      xga: unavailableProvenance(),
      cards: unavailableProvenance(),
    },
  };
}

function createDerivedTeamProvenance() {
  return {
    source: "verified-result-feed",
    attacking: {
      avgGoals: derivedProvenance("recent-finished-results"),
      shots: unavailableProvenance(),
      shotsOnTarget: unavailableProvenance(),
      bigChances: unavailableProvenance(),
      xg: unavailableProvenance(),
    },
    defensive: {
      goalsConcededAvg: derivedProvenance("recent-finished-results"),
      cleanSheetPct: derivedProvenance("recent-finished-results"),
      xga: unavailableProvenance(),
      cards: unavailableProvenance(),
    },
  };
}

function derivedProvenance(method) {
  return {
    sourceType: "derived",
    source: "verified result feed",
    method,
    verified: false,
  };
}

function unavailableProvenance() {
  return {
    sourceType: "unavailable",
    source: null,
    verified: false,
  };
}

function roundMetric(value, digits = 2) {
  return Number(value.toFixed(digits));
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function normalizeLeague(value) {
  const aliases = {
    PL: "EPL",
    PD: "LALIGA",
    SA: "SERIEA",
    FL1: "LIGUE1",
    CL: "UCL",
    EL: "UEL",
  };

  return aliases[String(value || "").toUpperCase()] || "";
}

function normalizeStatus(status) {
  const clean = String(status || "").toUpperCase();
  if (clean === "IN_PLAY" || clean === "LIVE") return "live";
  if (clean === "PAUSED") return "halftime";
  if (clean === "FINISHED" || clean === "AWARDED") return "finished";
  if (clean === "POSTPONED") return "postponed";
  if (clean === "SUSPENDED") return "suspended";
  if (clean === "CANCELLED" || clean === "CANCELED") return "cancelled";

  return "upcoming";
}

function normalizeScore(score) {
  if (!score || typeof score !== "object") return null;

  const candidates = [score.fullTime, score.regularTime, score.halfTime, score];
  for (const candidate of candidates) {
    const home = Number(candidate?.home ?? candidate?.homeTeam);
    const away = Number(candidate?.away ?? candidate?.awayTeam);
    if (Number.isFinite(home) && Number.isFinite(away)) return { home, away };
  }

  return null;
}

function formatStage(match) {
  return String(match.stage || match.group || (match.matchday ? `Matchday ${match.matchday}` : "") || "")
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function createTeamId(name, league) {
  const stem = String(name)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 10);

  return `${league}_${stem || "TEAM"}`;
}

function makeShortName(name) {
  return String(name)
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 4)
    .toUpperCase();
}

function formatDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatDateInTimeZone(date) {
  const parts = getDateTimeParts(date);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function formatClockTimeInTimeZone(date) {
  const parts = getDateTimeParts(date);
  return `${parts.hour}:${parts.minute}`;
}

function getDateTimeParts(date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: DISPLAY_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return {
    year: values.year,
    month: values.month,
    day: values.day,
    hour: values.hour === "24" ? "00" : values.hour,
    minute: values.minute,
  };
}

function addDays(date, days) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function sortMatches(a, b) {
  return a.date.localeCompare(b.date) || a.time.localeCompare(b.time);
}
