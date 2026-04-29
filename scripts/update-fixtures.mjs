import { writeFile } from "node:fs/promises";

const API_BASE = "https://api.football-data.org/v4";
const COMPETITIONS = ["PL", "PD", "SA", "BL1", "CL"];
const OUT_FILE = "fixtures.live.json";

const token = process.env.FOOTBALL_DATA_TOKEN;

if (!token) {
  throw new Error("Missing FOOTBALL_DATA_TOKEN secret.");
}

const from = formatDateKey(addDays(new Date(), -1));
const to = formatDateKey(addDays(new Date(), 8));
const params = new URLSearchParams({
  competitions: COMPETITIONS.join(","),
  dateFrom: from,
  dateTo: to
});

const response = await fetch(`${API_BASE}/matches?${params.toString()}`, {
  headers: {
    "X-Auth-Token": token
  }
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

const converted = convertFootballData(payload, from, to);
await writeFile(OUT_FILE, `${JSON.stringify(converted, null, 2)}\n`);
console.log(`Wrote ${converted.matches.length} fixtures to ${OUT_FILE}.`);

function convertFootballData(payload, fromDate, toDate) {
  const apiMatches = Array.isArray(payload?.matches) ? payload.matches : [];
  const teams = new Map();
  const matches = apiMatches
    .map((match, index) => convertMatch(match, index, teams))
    .filter(Boolean)
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

  if (!matches.length) {
    throw new Error("football-data.org returned no supported fixtures for the configured date range.");
  }

  return {
    meta: {
      source: "football-data.org live feed",
      updatedAt: new Date().toISOString().slice(0, 10),
      note: `Real fixtures and scores for ${fromDate} to ${toDate}.`
    },
    teams: [...teams.values()].sort((a, b) => a.name.localeCompare(b.name)),
    matches
  };
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
    date: hasKickoff ? formatDateKey(kickoff) : formatDateKey(new Date()),
    time: hasKickoff ? formatClockTime(kickoff) : "00:00",
    homeTeamId: homeTeam.id,
    awayTeamId: awayTeam.id,
    homeTeam: homeTeam.name,
    awayTeam: awayTeam.name,
    status: normalizeStatus(match.status),
    venue: match.venue || "",
    stage: formatStage(match),
    score: normalizeScore(match.score)
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
    league
  };
}

function normalizeLeague(value) {
  const aliases = {
    PL: "EPL",
    PD: "LALIGA",
    SA: "SERIEA",
    BL1: "BUNDESLIGA",
    CL: "UCL"
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

function formatClockTime(date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function addDays(date, days) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}
