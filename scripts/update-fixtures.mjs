import { readFile, writeFile } from "node:fs/promises";

const API_BASE = "https://api.football-data.org/v4";
const COMPETITIONS = ["PL", "PD", "SA", "BL1", "CL", "WC"];
const OUT_FILE = "fixtures.live.json";
const DISPLAY_TIME_ZONE = process.env.FIXTURE_TIME_ZONE || "Asia/Kolkata";
const MAX_WINDOW_DAYS = 10;
const FORM_LOOKBACK_DAYS = 220;
const MAX_FORM_MATCHES = 5;

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
  let start = fromDate;

  while (start <= toDate) {
    const windowEnd = addDays(start, MAX_WINDOW_DAYS - 1);
    const end = windowEnd > toDate ? toDate : windowEnd;

    const params = new URLSearchParams({
      competitions: COMPETITIONS.join(","),
      dateFrom: formatDateKey(start),
      dateTo: formatDateKey(end),
      ...extraParams,
    });

    const response = await fetch(`${API_BASE}/matches?${params.toString()}`, {
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

    if (!response.ok) {
      const message = payload?.message || payload?.error || `HTTP ${response.status}`;
      throw new Error(`football-data.org request failed: ${message}`);
    }

    const windowMatches = Array.isArray(payload?.matches) ? payload.matches : [];
    matches.push(...windowMatches);

    start = addDays(end, 1);
  }

  return matches;
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

  return {
    meta: {
      source: "football-data.org live feed",
      updatedAt: new Date().toISOString().slice(0, 10),
      note: `Real fixtures and scores for ${fromDate} to ${toDate}.
Times shown in ${DISPLAY_TIME_ZONE}.`,
    },
    teams: [...teams.values()].sort((a, b) => a.name.localeCompare(b.name)),
    matches: mergedMatches,
  };
}

function mergeRecentFinishedMatches(newMatches, oldMatches, fromDate, teams, existingTeams) {
  const merged = new Map(newMatches.map((match) => [match.id, match]));

  oldMatches
    .filter((match) => match.status === "finished" && match.date >= fromDate)
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
    form: [],
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
  if (team.league === "WC" && formMatch.competition !== "WC") return;
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

function normalizeLeague(value) {
  const aliases = {
    PL: "EPL",
    PD: "LALIGA",
    SA: "SERIEA",
    BL1: "BUNDESLIGA",
    CL: "UCL",
    WC: "WC",
  };

  return aliases[String(value || "").toUpperCase()] || "";
}

function normalizeStatus(status) {
  const clean = String(status || "").toUpperCase();
  if (clean === "IN_PLAY" || clean === "LIVE") return "live";
  if (clean === "PAUSED") return "halftime";
  if (clean === "FINISHED" || clean === "AWARDED") return "finished";

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
