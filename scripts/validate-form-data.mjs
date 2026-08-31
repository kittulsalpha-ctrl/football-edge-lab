import { readFile } from "node:fs/promises";

const feed = JSON.parse(await readFile("fixtures.live.json", "utf8"));
const indexSource = await readFile("index.html", "utf8");
const appSource = await readFile("app.js", "utf8");
const engineSource = await readFile("prediction-engine-v2.js", "utf8");
const updaterSource = await readFile("scripts/update-fixtures.mjs", "utf8");

const eplFallbackOpponents = ["Everton", "West Ham", "Fulham", "Brentford", "Bournemouth", "Newcastle United"];
const focusedLeagues = new Set(["EPL", "LALIGA", "SERIEA", "LIGUE1", "UCL", "UEL"]);

assert(Array.isArray(feed.teams), "fixtures.live.json must export a teams array.");
assert(feed.teams.every((team) => Array.isArray(team.form)), "Every exported team must include a form array.");
assert(feed.teams.every((team) => focusedLeagues.has(team.league)), "Live fixture feed contains team metadata outside the focused GoalIQ scope.");
assert((feed.matches || []).every((match) => focusedLeagues.has(match.league)), "Live fixture feed contains a league outside the focused GoalIQ scope.");
assert(
  (feed.historicalMatches || feed.history || []).every((match) => focusedLeagues.has(match.league || match.competitionId)),
  "Historical fixture feed contains a league outside the focused GoalIQ scope."
);

feed.teams.forEach((team) => {
  assert(team.form.length <= 5, `${team.name} exports more than five form matches.`);
  team.form.forEach((match) => {
    assert(typeof match.date === "string" && match.date.length > 0, `${team.name} has a form row without a date.`);
    assert(typeof match.competition === "string" && match.competition.length > 0, `${team.name} has a form row without a competition.`);
    assert(typeof match.opponent === "string" && match.opponent.length > 0, `${team.name} has a form row without an opponent.`);
    assert(["H", "A"].includes(match.venue), `${team.name} has a form row with invalid venue ${match.venue}.`);
    assert(Number.isFinite(Number(match.goalsFor)), `${team.name} has a form row without goalsFor.`);
    assert(Number.isFinite(Number(match.goalsAgainst)), `${team.name} has a form row without goalsAgainst.`);
    assert(
      focusedLeagues.has(match.competition),
      `${team.name} form contains a competition outside the focused GoalIQ scope: ${match.competition}.`
    );
  });
});

["France", "Senegal"].forEach((teamName) => {
  const team = findTeam(teamName);
  if (!team) return;
  const leakedOpponent = team.form.find((match) => eplFallbackOpponents.includes(match.opponent));
  assert(!leakedOpponent, `${teamName} form contains EPL fallback opponent ${leakedOpponent?.opponent}.`);
});

assert(
  appSource.includes("No recent form data available"),
  "Form panel must render an explicit no-data state for imported teams without form."
);
assert(
  appSource.includes("if (!Array.isArray(form)) return [];"),
  "Imported teams without form must not fall back to demo/generated form."
);
assert(
  !appSource.includes("normalizeImportedForm(team.form, base.form)"),
  "Imported teams must not pass demo form as an import fallback."
);
assert(appSource.includes("function makeImportedTeam"), "Imported teams need a non-demo team factory.");
assert(appSource.includes("function buildTeamProfileFromForm"), "Imported teams with real form must derive team stats from that form.");
assert(appSource.includes("buildTeamProfileFromForm(importedForm"), "Imported team normalization must apply form-derived profiles.");
assert(appSource.includes("GoalIQPredictionEngine"), "The browser app must use GoalIQ Prediction Engine v2.");
assert(appSource.includes("renderProvenanceComparisonRows"), "Stats UI must render provenance-aware rows.");
assert(appSource.includes("Verified statistic"), "Stats UI must distinguish verified provider statistics.");
assert(appSource.includes("Model estimate"), "Stats UI must distinguish model estimates.");
assert(appSource.includes("expectedGoalsModel"), "Imported teams must reserve modelled goal estimates for model output.");
assert(
  !updaterSource.includes("shots: roundMetric(clamp") && !updaterSource.includes("xg: roundMetric(clamp") && !updaterSource.includes("cards: roundMetric(clamp"),
  "Fixture updater must not synthesize shots, xG, xGA, big chances, or cards."
);
assert(engineSource.includes('const MODEL_VERSION = "goaliq-2.0.0"'), "Prediction engine v2 must expose a model version.");
assert(engineSource.includes("function dixonColesAdjustment"), "Prediction engine v2 must include a Dixon-Coles low-score correction.");
assert(engineSource.includes("function backtestPredictions"), "Prediction engine v2 must include an offline backtesting engine.");
assert(engineSource.includes("function createPredictionSnapshot"), "Prediction engine v2 must support immutable prediction snapshots.");
assert(engineSource.includes("sourceType: \"unavailable\""), "Unavailable advanced stats must be represented explicitly.");
assert(engineSource.includes("sourceType: \"model\""), "Model estimates must carry explicit provenance.");
assert(appSource.includes("function clearFixtureBoard"), "Public startup must be able to clear demo fixtures before live feed load.");
assert(
  appSource.includes("Demo fixtures are disabled on the public board"),
  "Public startup must not present demo fixtures as verified live data."
);
assert(
  !appSource.includes("Using the built-in demo snapshot"),
  "Live-feed failure must not fall back to the built-in demo snapshot on public startup."
);
assert(appSource.includes("function getFixtureHeadToHead"), "Live/imported H2H must come from finished fixture feed meetings.");
assert(appSource.includes("No verified head-to-head data"), "Live/imported teams without H2H need a no-data state.");
assert(appSource.includes("form: []"), "Imported teams without real form should keep an empty form array.");
assert(appSource.includes("const seedTeams = cloneTeamMap(teams);"), "Demo team snapshot must be kept for reset.");
assert(appSource.includes("resetTeamsToSeed();"), "Reset must restore the built-in demo team data.");
assert(indexSource.includes('data-view="picks"'), "Top Picks must be available as a primary navigation tab.");
assert(appSource.includes("function renderTopPicksView"), "Top Picks must render as a dedicated view.");
assert(appSource.includes("function isFocusedMatch"), "Fixture board must filter to the focused league scope.");
assert(updaterSource.includes('"FL1"'), "Fixture updater must include Ligue 1 via football-data.org FL1.");
assert(updaterSource.includes('"EL"'), "Fixture updater must include UEFA Europa League via football-data.org EL.");
assert(!updaterSource.includes('"WC"'), "Fixture updater must no longer fetch World Cup fixtures.");
assert(!indexSource.includes('data-view="worldcup"'), "World Cup must not be a primary navigation tab.");
assert(!appSource.includes("WORLD_CUP_PICK_STORAGE_KEY"), "World Cup bracket pick storage must be removed.");
assert(!appSource.includes("function renderWorldCupView"), "World Cup bracket renderer must be removed.");
assert(!appSource.includes("function buildLiveWorldCupBracket"), "World Cup live bracket builder must be removed.");

console.log("Form data validation passed.");

function findTeam(name) {
  const clean = normalizeName(name);
  return feed.teams.find((team) => normalizeName(team.name) === clean || normalizeName(team.shortName) === clean);
}

function normalizeName(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}
