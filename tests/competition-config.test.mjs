import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  COMPETITIONS,
  applyStandingResult,
  getCompetitionByApiCode,
  getLocalDateTimeParts,
  getQualificationZone,
  hasUsablePayload,
  makeInitials,
  normalizeCompetitionId,
  normalizeFixtureStatus,
  roundOutcomePercentages,
  sortStandingsRows,
} from "../scripts/competition-config.mjs";

describe("competition configuration", () => {
  it("normalizes public competition aliases", () => {
    assert.equal(normalizeCompetitionId("Premier League"), "EPL");
    assert.equal(normalizeCompetitionId("PL"), "EPL");
    assert.equal(normalizeCompetitionId("Primera División"), "LALIGA");
    assert.equal(normalizeCompetitionId("BL1"), "BUNDESLIGA");
    assert.equal(normalizeCompetitionId("Seria A"), "SERIEA");
    assert.equal(normalizeCompetitionId("World Cup"), "WC");
  });

  it("maps football-data.org API codes", () => {
    assert.equal(getCompetitionByApiCode("PL")?.id, "EPL");
    assert.equal(getCompetitionByApiCode("PD")?.id, "LALIGA");
    assert.equal(getCompetitionByApiCode("BL1")?.id, "BUNDESLIGA");
    assert.equal(getCompetitionByApiCode("SA")?.id, "SERIEA");
    assert.equal(getCompetitionByApiCode("WC")?.id, "WC");
  });

  it("normalizes provider fixture statuses", () => {
    assert.equal(normalizeFixtureStatus("SCHEDULED"), "upcoming");
    assert.equal(normalizeFixtureStatus("TIMED"), "upcoming");
    assert.equal(normalizeFixtureStatus("IN_PLAY"), "live");
    assert.equal(normalizeFixtureStatus("PAUSED"), "halftime");
    assert.equal(normalizeFixtureStatus("FINISHED"), "finished");
    assert.equal(normalizeFixtureStatus("POSTPONED"), "postponed");
    assert.equal(normalizeFixtureStatus("SUSPENDED"), "suspended");
    assert.equal(normalizeFixtureStatus("CANCELLED"), "cancelled");
  });

  it("groups UTC kickoffs into the requested local date", () => {
    const india = getLocalDateTimeParts("2026-07-14T19:00:00Z", "Asia/Kolkata");
    const newYork = getLocalDateTimeParts("2026-07-14T02:30:00Z", "America/New_York");
    assert.deepEqual(india, { date: "2026-07-15", time: "00:30" });
    assert.deepEqual(newYork, { date: "2026-07-13", time: "22:30" });
  });

  it("rounds outcome percentages to exactly 100", () => {
    const rounded = roundOutcomePercentages({ home: 0.333, draw: 0.333, away: 0.333 });
    assert.equal(rounded.home + rounded.draw + rounded.away, 100);
  });

  it("sorts standings by points, goal difference, goals for, then name", () => {
    const rows = [
      { teamName: "Beta", points: 10, goalDifference: 4, goalsFor: 12 },
      { teamName: "Alpha", points: 10, goalDifference: 4, goalsFor: 13 },
      { teamName: "Gamma", points: 11, goalDifference: 0, goalsFor: 8 },
    ];
    assert.deepEqual(sortStandingsRows(rows).map((row) => row.teamName), ["Gamma", "Alpha", "Beta"]);
  });

  it("calculates goal difference and points for standing rows", () => {
    const row = { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0, form: [] };
    applyStandingResult(row, 2, 1);
    applyStandingResult(row, 0, 0);
    assert.equal(row.played, 2);
    assert.equal(row.won, 1);
    assert.equal(row.drawn, 1);
    assert.equal(row.goalDifference, 1);
    assert.equal(row.points, 4);
    assert.deepEqual(row.form, ["W", "D"]);
  });

  it("keeps qualification zones in config", () => {
    assert.equal(getQualificationZone("EPL", 1)?.type, "champions");
    assert.equal(getQualificationZone("EPL", 18)?.type, "relegation");
    assert.equal(COMPETITIONS.BUNDESLIGA.qualificationZones.at(-1).from, 17);
  });

  it("detects usable and empty provider payloads", () => {
    assert.equal(hasUsablePayload({ matches: [{}] }), true);
    assert.equal(hasUsablePayload({ standings: { EPL: { table: [{ points: 1 }] } } }), true);
    assert.equal(hasUsablePayload({ standings: { EPL: { table: [] } } }), false);
    assert.equal(hasUsablePayload({ matches: [] }), false);
    assert.equal(makeInitials("Real Madrid"), "RM");
  });
});
