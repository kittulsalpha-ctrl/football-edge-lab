import { mkdir, readFile, writeFile } from "node:fs/promises";

await import("../prediction-engine-v2.js");

const engine = globalThis.GoalIQPredictionEngine;
const feed = JSON.parse(await readFile("fixtures.live.json", "utf8"));
const teams = Object.fromEntries((feed.teams || []).map((team) => [team.id, team]));
const matches = [...(feed.historicalMatches || feed.history || []), ...(feed.matches || [])];

const report = engine.backtestPredictions({
  matches,
  teams,
  leagueProfiles: getLeagueProfiles(),
  fixtureMeta: feed.meta || {}
});

await mkdir("generated", { recursive: true });
await writeFile("generated/model-backtest.json", `${JSON.stringify(report, null, 2)}\n`);

console.log(
  `Backtest complete: ${report.samples} samples, Brier ${report.brierScore ?? "n/a"}, log loss ${report.logLoss ?? "n/a"}, top-pick accuracy ${report.topPickAccuracy ?? "n/a"}.`
);

function getLeagueProfiles() {
  return {
    EPL: { avgGoals: 2.82, homeAdvantage: 0.12 },
    LALIGA: { avgGoals: 2.58, homeAdvantage: 0.13 },
    SERIEA: { avgGoals: 2.62, homeAdvantage: 0.11 },
    BUNDESLIGA: { avgGoals: 3.08, homeAdvantage: 0.1 },
    UCL: { avgGoals: 2.96, homeAdvantage: 0.08 },
    WC: { avgGoals: 2.65, homeAdvantage: 0.04 }
  };
}
