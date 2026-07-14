import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { describe, it } from "node:test";

const appSource = await readFile("app.js", "utf8");
const swSource = await readFile("sw.js", "utf8");
const mobilePrepareSource = await readFile("scripts/prepare-mobile.mjs", "utf8");
const fixtures = JSON.parse(await readFile("fixtures.live.json", "utf8"));
const standings = JSON.parse(await readFile("standings.live.json", "utf8"));
const competitions = JSON.parse(await readFile("competitions.live.json", "utf8"));

describe("GoalIQ domestic league app wiring", () => {
  it("loads the new live JSON feeds", () => {
    assert.match(appSource, /standings\.live\.json/);
    assert.match(appSource, /competitions\.live\.json/);
    assert.match(appSource, /loadLiveStandingsFeed/);
    assert.match(appSource, /loadLiveCompetitionsFeed/);
  });

  it("persists and routes competition selection", () => {
    assert.match(appSource, /COMPETITION_FILTER_STORAGE_KEY/);
    assert.match(appSource, /sessionStorage\.setItem/);
    assert.match(appSource, /#competition\/epl/);
    assert.match(appSource, /#worldcup-2026/);
  });

  it("renders honest unavailable states instead of fake data", () => {
    assert.match(appSource, /No recent form data available/);
    assert.match(appSource, /Statistics unavailable/);
    assert.match(appSource, /No verified head-to-head data/);
    assert.match(appSource, /The 2026\/27 league table will appear/);
  });

  it("includes live feeds in PWA and mobile packaging", () => {
    for (const filename of ["fixtures.live.json", "standings.live.json", "competitions.live.json"]) {
      assert.match(swSource, new RegExp(filename.replace(".", "\\.")));
      assert.match(mobilePrepareSource, new RegExp(filename.replace(".", "\\.")));
    }
  });

  it("exports normalized fixture fields for all current matches", () => {
    assert.ok(fixtures.matches.length > 0);
    for (const match of fixtures.matches) {
      assert.ok(match.competitionId, `${match.id} missing competitionId`);
      assert.ok(match.date, `${match.id} missing date`);
      assert.ok("utcDate" in match, `${match.id} missing utcDate field`);
      assert.ok("homeScore" in match, `${match.id} missing homeScore field`);
      assert.ok("awayScore" in match, `${match.id} missing awayScore field`);
    }
  });

  it("publishes standings and competition metadata for each supported public competition", () => {
    for (const id of ["WC", "EPL", "LALIGA", "BUNDESLIGA", "SERIEA"]) {
      assert.ok(standings.standings[id], `${id} standing missing`);
      assert.ok(competitions.competitions[id], `${id} competition metadata missing`);
    }
  });
});
