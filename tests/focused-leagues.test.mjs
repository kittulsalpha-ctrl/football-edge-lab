import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { describe, it } from "node:test";

const allowedLeagues = new Set(["EPL", "LALIGA", "SERIEA", "LIGUE1", "UCL", "UEL"]);

describe("GoalIQ focused competition scope", () => {
  it("exposes Top Picks as a tab and removes the World Cup bracket route", async () => {
    const indexSource = await readFile("index.html", "utf8");
    const appSource = await readFile("app.js", "utf8");

    assert.match(indexSource, /data-view="picks"/);
    assert.doesNotMatch(indexSource, /data-view="worldcup"/i);
    assert.doesNotMatch(appSource, /renderWorldCupView|WORLD_CUP_PICK_STORAGE_KEY|buildLiveWorldCupBracket/);
  });

  it("keeps bundled fixtures, teams, history, and form inside the focused leagues", async () => {
    const feed = JSON.parse(await readFile("fixtures.live.json", "utf8"));

    for (const team of feed.teams || []) {
      assert.ok(allowedLeagues.has(team.league), `${team.name} uses unsupported league ${team.league}`);
      for (const formRow of team.form || []) {
        assert.ok(
          allowedLeagues.has(formRow.competition),
          `${team.name} form uses unsupported competition ${formRow.competition}`
        );
      }
    }

    for (const match of feed.matches || []) {
      assert.ok(allowedLeagues.has(match.league), `${match.id} uses unsupported league ${match.league}`);
    }

    for (const match of feed.historicalMatches || feed.history || []) {
      assert.ok(
        allowedLeagues.has(match.league || match.competitionId),
        `${match.id} uses unsupported historical league ${match.league || match.competitionId}`
      );
    }
  });

  it("keeps Upcoming scoped to one selected matchday instead of the full future schedule", async () => {
    const appSource = await readFile("app.js", "utf8");
    const getUpcomingMatchesSource = extractFunction(appSource, "getUpcomingMatches");

    assert.match(getUpcomingMatchesSource, /match\.date === state\.selectedDate/);
    assert.doesNotMatch(getUpcomingMatchesSource, /match\.date >= state\.selectedDate/);
    assert.match(appSource, /function moveToUpcomingMatchday\(/);
    assert.match(appSource, /getNextUpcomingMatchDate\(fromDate, \{ includeSelectedDate \}\)/);
  });
});

function extractFunction(source, name) {
  const start = source.indexOf(`function ${name}(`);
  assert.notEqual(start, -1, `${name} was not found`);
  const nextFunction = source.indexOf("\nfunction ", start + 1);
  return source.slice(start, nextFunction === -1 ? undefined : nextFunction);
}
