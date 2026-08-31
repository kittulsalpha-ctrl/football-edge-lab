import { readFile } from "node:fs/promises";

const feed = JSON.parse(await readFile("fixtures.live.json", "utf8"));
const appSource = await readFile("app.js", "utf8");
const engineSource = await readFile("prediction-engine-v2.js", "utf8");
const updaterSource = await readFile("scripts/update-fixtures.mjs", "utf8");

const eplFallbackOpponents = ["Everton", "West Ham", "Fulham", "Brentford", "Bournemouth", "Newcastle United"];

assert(Array.isArray(feed.teams), "fixtures.live.json must export a teams array.");
assert(feed.teams.every((team) => Array.isArray(team.form)), "Every exported team must include a form array.");

feed.teams.forEach((team) => {
  assert(team.form.length <= 5, `${team.name} exports more than five form matches.`);
  team.form.forEach((match) => {
    assert(typeof match.date === "string" && match.date.length > 0, `${team.name} has a form row without a date.`);
    assert(typeof match.competition === "string" && match.competition.length > 0, `${team.name} has a form row without a competition.`);
    assert(typeof match.opponent === "string" && match.opponent.length > 0, `${team.name} has a form row without an opponent.`);
    assert(["H", "A"].includes(match.venue), `${team.name} has a form row with invalid venue ${match.venue}.`);
    assert(Number.isFinite(Number(match.goalsFor)), `${team.name} has a form row without goalsFor.`);
    assert(Number.isFinite(Number(match.goalsAgainst)), `${team.name} has a form row without goalsAgainst.`);
  });
});

feed.teams
  .filter((team) => team.league === "WC")
  .forEach((team) => {
    team.form.forEach((match) => {
      assert(match.competition === "WC", `${team.name} World Cup form includes non-WC competition ${match.competition}.`);
      assert(!eplFallbackOpponents.includes(match.opponent), `${team.name} form contains EPL fallback opponent ${match.opponent}.`);
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

if (feed.matches?.some((match) => match.league === "WC" && /last 16|round of 16|quarter|semi|final/i.test(match.stage || ""))) {
  assert(appSource.includes("function buildLiveWorldCupBracket"), "World Cup page must build a bracket from live knockout fixtures.");
  assert(appSource.includes("bracket.mode === \"liveFeed\""), "World Cup UI must render a live-feed bracket mode.");
}

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
