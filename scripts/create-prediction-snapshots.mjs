import { mkdir, readFile, writeFile } from "node:fs/promises";

await import("../prediction-engine-v2.js");

const engine = globalThis.GoalIQPredictionEngine;
const feed = JSON.parse(await readFile("fixtures.live.json", "utf8"));
const teams = Object.fromEntries((feed.teams || []).map((team) => [team.id, team]));
const generatedAt = new Date().toISOString();
const snapshot = engine.createPredictionSnapshot({
  matches: feed.matches || [],
  teams,
  leagueProfiles: getLeagueProfiles(),
  fixtureMeta: feed.meta || {},
  generatedAt
});
const dateKey = generatedAt.slice(0, 10);

await mkdir("generated/prediction-snapshots", { recursive: true });
await writeFile(`generated/prediction-snapshots/${dateKey}.json`, `${JSON.stringify(snapshot, null, 2)}\n`);

console.log(`Prediction snapshot complete: ${snapshot.predictions.length} upcoming predictions.`);

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
