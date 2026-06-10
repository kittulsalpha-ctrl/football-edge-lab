import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildWorldCupBracket, getSeededKnockoutSlots, rankWorldCupGroup, worldCupGroups } from "../scripts/worldcup-bracket.mjs";

const groupA = worldCupGroups.find((group) => group.name === "A");

const groupAFixtures = [
  { homeTeam: "Mexico", awayTeam: "South Africa", result: { home: 2, away: 0 } },
  { homeTeam: "South Korea", awayTeam: "Czechia", result: { home: 3, away: 0 } },
  { homeTeam: "Mexico", awayTeam: "South Korea", result: { home: 2, away: 1 } },
  { homeTeam: "Czechia", awayTeam: "South Africa", result: { home: 0, away: 0 } },
  { homeTeam: "Mexico", awayTeam: "Czechia", result: { home: 1, away: 0 } },
  { homeTeam: "South Africa", awayTeam: "South Korea", result: { home: 1, away: 2 } }
];

describe("World Cup bracket logic", () => {
  it("ranks group teams by points, goal difference, goals scored, then rating", () => {
    const table = rankWorldCupGroup(groupA, groupAFixtures);

    assert.equal(table[0].team.name, "Mexico");
    assert.equal(table[0].points, 9);
    assert.equal(table[1].team.name, "South Korea");
    assert.equal(table[1].points, 6);
    assert.equal(table[2].team.name, "South Africa");
    assert.equal(table[3].team.name, "Czechia");
  });

  it("places group winners and runners-up into knockout seed slots", () => {
    const { slots } = getSeededKnockoutSlots({ groupFixtures: groupAFixtures });

    assert.equal(slots.A1.name, "Mexico");
    assert.equal(slots.A2.name, "South Korea");
  });

  it("advances a user-picked Round of 32 winner into the correct Round of 16 slot", () => {
    const bracket = buildWorldCupBracket({
      groupFixtures: groupAFixtures,
      userPicks: { M73: "KOR" }
    });
    const roundOf32Match = bracket.matchesById.get("M73");
    const roundOf16Match = bracket.matchesById.get("M89");

    assert.equal(roundOf32Match.winner.code, "KOR");
    assert.equal(roundOf16Match.home.code, "KOR");
  });

  it("lets actual knockout results override user picks", () => {
    const bracket = buildWorldCupBracket({
      groupFixtures: groupAFixtures,
      userPicks: { M73: "KOR" },
      knockoutResults: { M73: { home: 0, away: 2 } }
    });
    const match = bracket.matchesById.get("M73");

    assert.equal(match.winner.code, "CAN");
    assert.equal(match.result.home, 0);
    assert.equal(match.result.away, 2);
  });
});
