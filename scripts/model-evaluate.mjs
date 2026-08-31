import { mkdir, readFile, writeFile } from "node:fs/promises";

await import("../prediction-engine-v2.js");

const engine = globalThis.GoalIQPredictionEngine;
const feed = JSON.parse(await readFile("fixtures.live.json", "utf8"));
const teams = Object.fromEntries((feed.teams || []).map((team) => [team.id, team]));
const matches = [...(feed.historicalMatches || feed.history || []), ...(feed.matches || [])];
const backtest = engine.backtestPredictions({
  matches,
  teams,
  leagueProfiles: getLeagueProfiles(),
  fixtureMeta: feed.meta || {}
});

const calibrationReport = {
  modelVersion: backtest.modelVersion,
  generatedAt: new Date().toISOString(),
  samples: backtest.samples,
  brierScore: backtest.brierScore,
  logLoss: backtest.logLoss,
  topPickAccuracy: backtest.topPickAccuracy,
  baselines: backtest.baselines,
  calibrationBuckets: backtest.calibrationBuckets,
  note:
    backtest.samples < 50
      ? "Small sample warning: this feed does not yet contain enough settled historical matches for reliable calibration conclusions."
      : "Calibration compares predicted probability buckets against observed outcomes."
};

await mkdir("generated", { recursive: true });
await writeFile("generated/calibration-report.json", `${JSON.stringify(calibrationReport, null, 2)}\n`);

console.log(`Calibration report complete: ${calibrationReport.samples} samples.`);

function getLeagueProfiles() {
  return {
    EPL: { avgGoals: 2.82, homeAdvantage: 0.12 },
    LALIGA: { avgGoals: 2.58, homeAdvantage: 0.13 },
    SERIEA: { avgGoals: 2.62, homeAdvantage: 0.11 },
    LIGUE1: { avgGoals: 2.74, homeAdvantage: 0.11 },
    UCL: { avgGoals: 2.96, homeAdvantage: 0.08 },
    UEL: { avgGoals: 2.78, homeAdvantage: 0.08 }
  };
}
