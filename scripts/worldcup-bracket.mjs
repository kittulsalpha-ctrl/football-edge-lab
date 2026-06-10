export const worldCupGroups = [
  group("A", [
    team("MEX", "Mexico", 1780),
    team("RSA", "South Africa", 1640),
    team("KOR", "South Korea", 1742),
    team("CZE", "Czechia", 1698)
  ]),
  group("B", [
    team("CAN", "Canada", 1710),
    team("BIH", "Bosnia and Herzegovina", 1660),
    team("QAT", "Qatar", 1654),
    team("SUI", "Switzerland", 1810)
  ]),
  group("C", [
    team("BRA", "Brazil", 1905),
    team("MAR", "Morocco", 1825),
    team("HAI", "Haiti", 1585),
    team("SCO", "Scotland", 1725)
  ]),
  group("D", [
    team("USA", "United States", 1775),
    team("PAR", "Paraguay", 1705),
    team("AUS", "Australia", 1712),
    team("TUR", "Turkey", 1768)
  ]),
  group("E", [
    team("GER", "Germany", 1880),
    team("CUR", "Curacao", 1580),
    team("CIV", "Ivory Coast", 1718),
    team("ECU", "Ecuador", 1788)
  ]),
  group("F", [
    team("NED", "Netherlands", 1868),
    team("JPN", "Japan", 1790),
    team("SWE", "Sweden", 1722),
    team("TUN", "Tunisia", 1688)
  ]),
  group("G", [
    team("BEL", "Belgium", 1848),
    team("EGY", "Egypt", 1715),
    team("IRN", "Iran", 1735),
    team("NZL", "New Zealand", 1568)
  ]),
  group("H", [
    team("ESP", "Spain", 1930),
    team("CPV", "Cape Verde", 1604),
    team("KSA", "Saudi Arabia", 1648),
    team("URU", "Uruguay", 1835)
  ]),
  group("I", [
    team("FRA", "France", 1915),
    team("SEN", "Senegal", 1772),
    team("IRQ", "Iraq", 1638),
    team("NOR", "Norway", 1758)
  ]),
  group("J", [
    team("ARG", "Argentina", 1920),
    team("ALG", "Algeria", 1710),
    team("AUT", "Austria", 1765),
    team("JOR", "Jordan", 1588)
  ]),
  group("K", [
    team("POR", "Portugal", 1888),
    team("COD", "DR Congo", 1658),
    team("UZB", "Uzbekistan", 1646),
    team("COL", "Colombia", 1805)
  ]),
  group("L", [
    team("ENG", "England", 1900),
    team("CRO", "Croatia", 1830),
    team("GHA", "Ghana", 1664),
    team("PAN", "Panama", 1622)
  ])
];

export const roundOf32Templates = [
  matchTemplate("M73", "Round of 32", "2026-06-28", "Los Angeles", slot("A", 2), slot("B", 2)),
  matchTemplate("M74", "Round of 32", "2026-06-28", "Houston", slot("C", 1), slot("F", 2)),
  matchTemplate("M75", "Round of 32", "2026-06-29", "Dallas", slot("E", 1), thirdSlot(["A", "B", "C", "D", "F"])),
  matchTemplate("M76", "Round of 32", "2026-06-29", "Mexico City", slot("F", 1), slot("C", 2)),
  matchTemplate("M77", "Round of 32", "2026-06-30", "New York New Jersey", slot("E", 2), slot("I", 2)),
  matchTemplate("M78", "Round of 32", "2026-06-30", "Atlanta", slot("I", 1), thirdSlot(["C", "D", "F", "G", "H"])),
  matchTemplate("M79", "Round of 32", "2026-07-01", "Monterrey", slot("A", 1), thirdSlot(["C", "E", "F", "H", "I"])),
  matchTemplate("M80", "Round of 32", "2026-07-01", "Vancouver", slot("L", 1), thirdSlot(["E", "H", "I", "J", "K"])),
  matchTemplate("M81", "Round of 32", "2026-07-02", "Seattle", slot("G", 1), thirdSlot(["A", "E", "H", "I", "J"])),
  matchTemplate("M82", "Round of 32", "2026-07-02", "Kansas City", slot("D", 1), thirdSlot(["B", "E", "F", "I", "J"])),
  matchTemplate("M83", "Round of 32", "2026-07-03", "Miami", slot("H", 1), slot("J", 2)),
  matchTemplate("M84", "Round of 32", "2026-07-03", "Boston", slot("K", 2), slot("L", 2)),
  matchTemplate("M85", "Round of 32", "2026-07-03", "Toronto", slot("B", 1), thirdSlot(["E", "F", "G", "I", "J"])),
  matchTemplate("M86", "Round of 32", "2026-07-03", "San Francisco Bay Area", slot("D", 2), slot("G", 2)),
  matchTemplate("M87", "Round of 32", "2026-07-03", "Philadelphia", slot("J", 1), slot("H", 2)),
  matchTemplate("M88", "Round of 32", "2026-07-03", "Dallas", slot("K", 1), thirdSlot(["D", "E", "I", "J", "L"]))
];

const laterRoundTemplates = [
  round("round16", "Round of 16", [
    ["M89", "2026-07-04", "Philadelphia", "M73", "M75"],
    ["M90", "2026-07-04", "Houston", "M74", "M77"],
    ["M91", "2026-07-05", "New York New Jersey", "M76", "M78"],
    ["M92", "2026-07-05", "Mexico City", "M79", "M80"],
    ["M93", "2026-07-06", "Dallas", "M83", "M84"],
    ["M94", "2026-07-06", "Seattle", "M81", "M82"],
    ["M95", "2026-07-07", "Atlanta", "M86", "M88"],
    ["M96", "2026-07-07", "Vancouver", "M85", "M87"]
  ]),
  round("quarterfinals", "Quarter-finals", [
    ["M97", "2026-07-09", "Boston", "M89", "M90"],
    ["M98", "2026-07-10", "Los Angeles", "M93", "M94"],
    ["M99", "2026-07-11", "Miami", "M91", "M92"],
    ["M100", "2026-07-11", "Kansas City", "M95", "M96"]
  ]),
  round("semifinals", "Semi-finals", [
    ["M101", "2026-07-14", "Dallas", "M97", "M98"],
    ["M102", "2026-07-15", "Atlanta", "M99", "M100"]
  ]),
  round("final", "Final", [["M104", "2026-07-19", "New York New Jersey", "M101", "M102"]])
];

export function rankWorldCupGroup(groupData, fixtures = []) {
  const table = groupData.teams.map((entry, index) => ({
    team: { ...entry, group: groupData.name, position: index + 1 },
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0
  }));
  const rows = new Map(table.map((row) => [normalizeName(row.team.name), row]));

  fixtures.forEach((fixture) => {
    const home = rows.get(normalizeName(fixture.homeTeam));
    const away = rows.get(normalizeName(fixture.awayTeam));
    const score = normalizeScore(fixture);
    if (!home || !away || !score) return;

    applyGroupScore(home, score.home, score.away);
    applyGroupScore(away, score.away, score.home);
  });

  return table.sort((a, b) => {
    return (
      b.points - a.points ||
      b.goalDifference - a.goalDifference ||
      b.goalsFor - a.goalsFor ||
      b.team.rating - a.team.rating ||
      a.team.name.localeCompare(b.team.name)
    );
  });
}

export function getSeededKnockoutSlots({ groups = worldCupGroups, groupFixtures = [] } = {}) {
  const standings = groups.map((groupData) => ({
    group: groupData.name,
    table: rankWorldCupGroup(groupData, groupFixtures)
  }));
  const slots = {};
  const thirdTeams = [];

  standings.forEach(({ group: groupName, table }) => {
    slots[`${groupName}1`] = table[0]?.team || null;
    slots[`${groupName}2`] = table[1]?.team || null;
    if (table[2]) thirdTeams.push({ ...table[2], sourceGroup: groupName });
  });

  thirdTeams
    .sort((a, b) => {
      return (
        b.points - a.points ||
        b.goalDifference - a.goalDifference ||
        b.goalsFor - a.goalsFor ||
        b.team.rating - a.team.rating ||
        a.team.name.localeCompare(b.team.name)
      );
    })
    .slice(0, 8)
    .forEach((row) => {
      slots[`${row.sourceGroup}3`] = row.team;
    });

  return { slots, standings, thirdTeams };
}

export function buildWorldCupBracket({
  groups = worldCupGroups,
  groupFixtures = [],
  knockoutResults = {},
  userPicks = {}
} = {}) {
  const seeded = getSeededKnockoutSlots({ groups, groupFixtures });
  const usedThirdGroups = new Set();
  const byId = new Map();
  const rounds = [
    {
      key: "round32",
      label: "Round of 32",
      matches: roundOf32Templates.map((template) => {
        const home = resolveSeed(template.home, seeded.slots, usedThirdGroups);
        const away = resolveSeed(template.away, seeded.slots, usedThirdGroups);
        const match = createKnockoutMatch(template, home, away, knockoutResults[template.id], userPicks[template.id]);
        byId.set(match.id, match);
        return match;
      })
    }
  ];

  laterRoundTemplates.forEach((roundTemplate) => {
    const matches = roundTemplate.matches.map(([id, date, venue, homeSource, awaySource]) => {
      const home = byId.get(homeSource)?.winner || null;
      const away = byId.get(awaySource)?.winner || null;
      const template = matchTemplate(id, roundTemplate.label, date, venue, previousSlot(homeSource), previousSlot(awaySource));
      const match = createKnockoutMatch(template, home, away, knockoutResults[id], userPicks[id]);
      byId.set(match.id, match);
      return match;
    });
    rounds.push({ key: roundTemplate.key, label: roundTemplate.label, matches });
  });

  const finalMatch = byId.get("M104");
  return {
    standings: seeded.standings,
    rounds,
    matchesById: byId,
    champion: finalMatch?.winner || null
  };
}

export function getMatchWinner(home, away, result, userPick) {
  if (!home || !away) return null;
  const score = normalizeScore(result || {});
  if (score) {
    if (score.home > score.away) return home;
    if (score.away > score.home) return away;
  }
  if (userPick) {
    if (userPick === home.code) return home;
    if (userPick === away.code) return away;
  }
  return home.rating >= away.rating ? home : away;
}

function createKnockoutMatch(template, home, away, result, userPick) {
  const modelWinner = !home || !away ? null : home.rating >= away.rating ? home : away;
  return {
    id: template.id,
    label: template.label,
    date: template.date,
    venue: template.venue,
    home,
    away,
    result: normalizeScore(result || {}) || null,
    userPick: userPick || null,
    modelWinner,
    winner: getMatchWinner(home, away, result, userPick),
    source: template
  };
}

function resolveSeed(seed, slots, usedThirdGroups) {
  if (seed.type === "previous") return null;
  if (seed.type === "group") return slots[`${seed.group}${seed.rank}`] || null;
  const selected = seed.groups.find((groupName) => slots[`${groupName}3`] && !usedThirdGroups.has(groupName));
  if (!selected) return null;
  usedThirdGroups.add(selected);
  return slots[`${selected}3`];
}

function applyGroupScore(row, goalsFor, goalsAgainst) {
  row.played += 1;
  row.goalsFor += goalsFor;
  row.goalsAgainst += goalsAgainst;
  row.goalDifference = row.goalsFor - row.goalsAgainst;
  if (goalsFor > goalsAgainst) {
    row.wins += 1;
    row.points += 3;
  } else if (goalsFor === goalsAgainst) {
    row.draws += 1;
    row.points += 1;
  } else {
    row.losses += 1;
  }
}

function normalizeScore(source) {
  const home = Number(source?.home ?? source?.homeGoals ?? source?.score?.home ?? source?.result?.home);
  const away = Number(source?.away ?? source?.awayGoals ?? source?.score?.away ?? source?.result?.away);
  if (!Number.isFinite(home) || !Number.isFinite(away)) return null;
  return { home, away };
}

function normalizeName(value) {
  const aliases = {
    "bosnia h": "bosnia and herzegovina",
    "bosnia herz": "bosnia and herzegovina",
    "usa": "united states",
    "ivory coast": "ivory coast",
    "cote d ivoire": "ivory coast",
    "curacao": "curacao"
  };
  const clean = String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
  return aliases[clean] || clean;
}

function group(name, teams) {
  return { name, teams: teams.map((entry, index) => ({ ...entry, group: name, position: index + 1 })) };
}

function team(code, name, rating) {
  return { code, name, shortName: code, rating };
}

function slot(groupName, rank) {
  return { type: "group", group: groupName, rank };
}

function thirdSlot(groups) {
  return { type: "third", groups };
}

function previousSlot(matchId) {
  return { type: "previous", matchId };
}

function matchTemplate(id, label, date, venue, home, away) {
  return { id, label, date, venue, home, away };
}

function round(key, label, matches) {
  return { key, label, matches };
}
