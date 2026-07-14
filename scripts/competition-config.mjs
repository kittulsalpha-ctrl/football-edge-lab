export const DOMESTIC_COMPETITION_IDS = ["EPL", "LALIGA", "BUNDESLIGA", "SERIEA"];
export const PUBLIC_COMPETITION_IDS = ["WC", ...DOMESTIC_COMPETITION_IDS];

export const COMPETITIONS = {
  WC: {
    id: "WC",
    name: "FIFA World Cup 2026",
    shortName: "World Cup",
    season: "2026",
    type: "international",
    apiCode: "WC",
    avgGoals: 2.65,
    homeAdvantage: 0.04,
    order: 0,
    qualificationZones: []
  },
  EPL: {
    id: "EPL",
    name: "Premier League",
    shortName: "EPL",
    season: "2026/27",
    type: "league",
    apiCode: "PL",
    avgGoals: 2.82,
    homeAdvantage: 0.12,
    order: 1,
    qualificationZones: [
      { from: 1, to: 4, type: "champions", label: "Champions League" },
      { from: 5, to: 6, type: "europa", label: "European places" },
      { from: 18, to: 20, type: "relegation", label: "Relegation" }
    ]
  },
  LALIGA: {
    id: "LALIGA",
    name: "La Liga",
    shortName: "La Liga",
    season: "2026/27",
    type: "league",
    apiCode: "PD",
    avgGoals: 2.58,
    homeAdvantage: 0.13,
    order: 2,
    qualificationZones: [
      { from: 1, to: 4, type: "champions", label: "Champions League" },
      { from: 5, to: 6, type: "europa", label: "European places" },
      { from: 18, to: 20, type: "relegation", label: "Relegation" }
    ]
  },
  BUNDESLIGA: {
    id: "BUNDESLIGA",
    name: "Bundesliga",
    shortName: "Bundesliga",
    season: "2026/27",
    type: "league",
    apiCode: "BL1",
    avgGoals: 3.08,
    homeAdvantage: 0.1,
    order: 3,
    qualificationZones: [
      { from: 1, to: 4, type: "champions", label: "Champions League" },
      { from: 5, to: 6, type: "europa", label: "European places" },
      { from: 17, to: 18, type: "relegation", label: "Relegation" }
    ]
  },
  SERIEA: {
    id: "SERIEA",
    name: "Serie A",
    shortName: "Serie A",
    season: "2026/27",
    type: "league",
    apiCode: "SA",
    avgGoals: 2.62,
    homeAdvantage: 0.11,
    order: 4,
    qualificationZones: [
      { from: 1, to: 4, type: "champions", label: "Champions League" },
      { from: 5, to: 6, type: "europa", label: "European places" },
      { from: 18, to: 20, type: "relegation", label: "Relegation" }
    ]
  },
  UCL: {
    id: "UCL",
    name: "UEFA Champions League",
    shortName: "UCL",
    season: "2026/27",
    type: "cup",
    apiCode: "CL",
    avgGoals: 2.96,
    homeAdvantage: 0.08,
    order: 5,
    qualificationZones: []
  }
};

const COMPETITION_ALIASES = new Map(
  Object.entries({
    "premier league": "EPL",
    "english premier league": "EPL",
    epl: "EPL",
    pl: "EPL",
    "la liga": "LALIGA",
    laliga: "LALIGA",
    "primera division": "LALIGA",
    "primera división": "LALIGA",
    pd: "LALIGA",
    bundesliga: "BUNDESLIGA",
    bl1: "BUNDESLIGA",
    "1 bundesliga": "BUNDESLIGA",
    "serie a": "SERIEA",
    "seria a": "SERIEA",
    sa: "SERIEA",
    "uefa champions league": "UCL",
    "champions league": "UCL",
    cl: "UCL",
    ucl: "UCL",
    "fifa world cup": "WC",
    "fifa world cup 2026": "WC",
    "world cup": "WC",
    wc: "WC"
  }).map(([alias, id]) => [normalizeText(alias), id])
);

export function normalizeCompetitionId(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const upper = raw.toUpperCase();
  if (COMPETITIONS[upper]) return upper;
  return COMPETITION_ALIASES.get(normalizeText(raw)) || upper;
}

export function getCompetitionByApiCode(apiCode) {
  const clean = String(apiCode || "").toUpperCase();
  return Object.values(COMPETITIONS).find((competition) => competition.apiCode === clean) || null;
}

export function normalizeFixtureStatus(status, { hasScore = false, date = "", today = "" } = {}) {
  const clean = String(status || "")
    .toLowerCase()
    .replace(/[_\s-]+/g, "");
  if (["inplay", "live"].includes(clean)) return "live";
  if (["paused", "halftime", "half", "ht"].includes(clean)) return "halftime";
  if (["finished", "awarded", "ft", "fulltime"].includes(clean)) return "finished";
  if (["postponed"].includes(clean)) return "postponed";
  if (["suspended"].includes(clean)) return "suspended";
  if (["cancelled", "canceled"].includes(clean)) return "cancelled";
  if (["scheduled", "timed", "upcoming"].includes(clean)) return "upcoming";
  if (hasScore) return "finished";
  if (date && today && date < today) return "finished";
  return "upcoming";
}

export function getLocalDateTimeParts(value, timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return {
    date: `${values.year}-${values.month}-${values.day}`,
    time: `${values.hour === "24" ? "00" : values.hour}:${values.minute}`
  };
}

export function createEmptyStandingRow(team) {
  return {
    teamId: team.id,
    teamName: team.name,
    shortName: team.shortName || makeInitials(team.name),
    crest: team.crest || "",
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
    form: []
  };
}

export function sortStandingsRows(rows) {
  return [...rows].sort((a, b) => {
    return (
      Number(b.points || 0) - Number(a.points || 0) ||
      Number(b.goalDifference || 0) - Number(a.goalDifference || 0) ||
      Number(b.goalsFor || 0) - Number(a.goalsFor || 0) ||
      String(a.teamName || a.name || "").localeCompare(String(b.teamName || b.name || ""))
    );
  });
}

export function applyStandingResult(row, goalsFor, goalsAgainst) {
  row.played += 1;
  row.goalsFor += goalsFor;
  row.goalsAgainst += goalsAgainst;
  row.goalDifference = row.goalsFor - row.goalsAgainst;
  if (goalsFor > goalsAgainst) {
    row.won += 1;
    row.points += 3;
    row.form.push("W");
  } else if (goalsFor === goalsAgainst) {
    row.drawn += 1;
    row.points += 1;
    row.form.push("D");
  } else {
    row.lost += 1;
    row.form.push("L");
  }
  row.form = row.form.slice(-5);
}

export function roundOutcomePercentages(probabilities) {
  const keys = ["home", "draw", "away"];
  const raw = keys.map((key) => Number(probabilities?.[key]) || 0);
  const total = raw.reduce((sum, value) => sum + value, 0) || 1;
  const exact = raw.map((value) => (value / total) * 100);
  const rounded = exact.map(Math.floor);
  let remainder = 100 - rounded.reduce((sum, value) => sum + value, 0);
  exact
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((a, b) => b.fraction - a.fraction)
    .forEach(({ index }) => {
      if (remainder <= 0) return;
      rounded[index] += 1;
      remainder -= 1;
    });
  return Object.fromEntries(keys.map((key, index) => [key, rounded[index]]));
}

export function hasUsablePayload(payload) {
  if (!payload) return false;
  if (Array.isArray(payload.matches) && payload.matches.length > 0) return true;
  if (Array.isArray(payload.teams) && payload.teams.length > 0) return true;
  if (payload.standings && typeof payload.standings === "object") {
    return Object.values(payload.standings).some((standing) => {
      if (Array.isArray(standing?.table)) return standing.table.length > 0;
      if (Array.isArray(standing?.rows)) return standing.rows.length > 0;
      return standing && Object.keys(standing).length > 0;
    });
  }
  return false;
}

export function makeInitials(value) {
  const words = String(value || "")
    .replace(/&/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  if (!words.length) return "TBD";
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
  return words.map((word) => word[0]).join("").slice(0, 4).toUpperCase();
}

export function getQualificationZone(competitionId, position) {
  const config = COMPETITIONS[normalizeCompetitionId(competitionId)];
  return config?.qualificationZones.find((zone) => position >= zone.from && position <= zone.to) || null;
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}
