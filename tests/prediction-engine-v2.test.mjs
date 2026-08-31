import assert from "node:assert/strict";
import { describe, it } from "node:test";

await import("../prediction-engine-v2.js");

const engine = globalThis.GoalIQPredictionEngine;

const teams = {
  ARS: { id: "ARS", name: "Arsenal", shortName: "ARS", rating: 1820, form: [] },
  CHE: { id: "CHE", name: "Chelsea", shortName: "CHE", rating: 1765, form: [] },
  LIV: { id: "LIV", name: "Liverpool", shortName: "LIV", rating: 1840, form: [] },
  EVE: { id: "EVE", name: "Everton", shortName: "EVE", rating: 1605, form: [] }
};

const leagueProfiles = {
  EPL: { avgGoals: 2.82, homeAdvantage: 0.12 }
};

const history = [
  finished("h1", "2026-01-01", "ARS", "EVE", 3, 0),
  finished("h2", "2026-01-08", "CHE", "LIV", 1, 2),
  finished("h3", "2026-01-15", "LIV", "ARS", 1, 1),
  finished("h4", "2026-01-22", "EVE", "CHE", 0, 2),
  finished("h5", "2026-01-29", "ARS", "CHE", 2, 1),
  finished("h6", "2026-02-05", "CHE", "EVE", 2, 0),
  finished("h7", "2026-02-12", "ARS", "LIV", 1, 0),
  finished("h8", "2026-02-19", "LIV", "CHE", 2, 2)
];

describe("GoalIQ Prediction Engine v2", () => {
  it("normalizes score matrix probabilities and derives consistent 1X2 markets", () => {
    const matrix = engine.buildScoreMatrix(1.55, 1.2, { home: 0, away: 0 }, 7, -0.08);
    const total = matrix.flat().reduce((sum, score) => sum + score.probability, 0);
    const summary = engine.summarizeScoreMatrix(matrix, { lambdaHome: 1.55, lambdaAway: 1.2 });

    assert.ok(Math.abs(total - 1) < 0.000001);
    assert.ok(Math.abs(summary.home + summary.draw + summary.away - 1) < 0.000001);
    assert.ok(Math.abs(summary.over25 + summary.under25 - 1) < 0.000001);
    assert.ok(summary.btts >= 0 && summary.btts <= 1);
  });

  it("does not leak future results into pre-match predictions", () => {
    const target = upcoming("target", "2026-03-01", "ARS", "CHE");
    const futureBlowout = finished("future", "2026-04-01", "CHE", "ARS", 7, 0);
    const withoutFuture = engine.predictMatchV2({
      match: target,
      matches: history,
      teams,
      leagueProfiles,
      fixtureMeta: { updatedAt: "2026-02-28" },
      generatedAt: "2026-02-28T12:00:00.000Z"
    });
    const withFuture = engine.predictMatchV2({
      match: target,
      matches: [...history, futureBlowout],
      teams,
      leagueProfiles,
      fixtureMeta: { updatedAt: "2026-02-28" },
      generatedAt: "2026-02-28T12:00:00.000Z"
    });

    assert.deepEqual(withFuture.final, withoutFuture.final);
    assert.equal(withFuture.predictedScore, withoutFuture.predictedScore);
  });

  it("marks missing advanced statistics unavailable instead of synthesizing xG or shots", () => {
    const prediction = engine.predictMatchV2({
      match: upcoming("target", "2026-03-01", "ARS", "CHE"),
      matches: history,
      teams,
      leagueProfiles,
      fixtureMeta: { updatedAt: "2026-02-28" },
      generatedAt: "2026-02-28T12:00:00.000Z"
    });
    const providerXg = prediction.statistics.attacking.find((row) => row.label === "Provider xG");
    const shots = prediction.statistics.attacking.find((row) => row.label === "Average shots");

    assert.equal(providerXg.home.sourceType, "unavailable");
    assert.equal(providerXg.away.sourceType, "unavailable");
    assert.equal(shots.home.sourceType, "unavailable");
    assert.equal(prediction.statistics.attacking.find((row) => row.label === "Expected scoring model").home.sourceType, "model");
  });

  it("uses provider provenance when imported historical stats include real xG", () => {
    const providerHistory = [
      {
        ...finished("xg1", "2026-01-01", "ARS", "CHE", 2, 1),
        homeXg: 1.8,
        awayXg: 0.9,
        homeShots: 14,
        awayShots: 7
      }
    ];
    const prediction = engine.predictMatchV2({
      match: upcoming("target", "2026-03-01", "ARS", "CHE"),
      matches: providerHistory,
      teams,
      leagueProfiles,
      fixtureMeta: { updatedAt: "2026-02-28" },
      generatedAt: "2026-02-28T12:00:00.000Z"
    });
    const providerXg = prediction.statistics.attacking.find((row) => row.label === "Provider xG");
    const shots = prediction.statistics.attacking.find((row) => row.label === "Average shots");

    assert.equal(providerXg.home.sourceType, "provider");
    assert.equal(providerXg.home.verified, true);
    assert.equal(shots.home.sourceType, "provider");
  });

  it("returns backtest accuracy, Brier score, log loss, calibration, and baselines", () => {
    const report = engine.backtestPredictions({
      matches: history,
      teams,
      leagueProfiles,
      fixtureMeta: { updatedAt: "2026-02-28" }
    });

    assert.equal(report.modelVersion, "goaliq-2.0.0");
    assert.equal(report.samples, history.length);
    assert.equal(typeof report.brierScore, "number");
    assert.equal(typeof report.logLoss, "number");
    assert.equal(report.calibrationBuckets.length, 10);
    assert.ok(report.baselines.homeTeam);
    assert.ok(report.baselines.leagueFrequency);
    assert.ok(report.baselines.eloOnly);
  });

  it("creates immutable prediction snapshots", () => {
    const upcomingMatch = upcoming("target", "2026-03-01", "ARS", "CHE");
    const snapshot = engine.createPredictionSnapshot({
      matches: [upcomingMatch, ...history],
      teams,
      leagueProfiles,
      fixtureMeta: { updatedAt: "2026-02-28" },
      generatedAt: "2026-02-28T12:00:00.000Z"
    });

    upcomingMatch.score = { home: 9, away: 0 };

    assert.equal(snapshot.predictions.length, 1);
    assert.equal(snapshot.predictions[0].matchId, "target");
    assert.equal(snapshot.predictions[0].predictedScore.includes("9-0"), false);
  });
});

function finished(id, date, homeTeamId, awayTeamId, homeGoals, awayGoals) {
  return {
    id,
    league: "EPL",
    date,
    time: "15:00",
    homeTeamId,
    awayTeamId,
    status: "finished",
    score: { home: homeGoals, away: awayGoals }
  };
}

function upcoming(id, date, homeTeamId, awayTeamId) {
  return {
    id,
    league: "EPL",
    date,
    time: "15:00",
    homeTeamId,
    awayTeamId,
    status: "upcoming"
  };
}
