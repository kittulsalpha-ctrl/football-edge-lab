const FIXTURE_STORAGE_KEY = "goaliq-fixture-data";
const LIVE_FIXTURE_FEED_URL = "fixtures.live.json";

const leagueProfiles = {
  EPL: {
    name: "Premier League",
    shortName: "EPL",
    avgGoals: 2.82,
    homeAdvantage: 0.12,
    order: 1
  },
  LALIGA: {
    name: "La Liga",
    shortName: "La Liga",
    avgGoals: 2.58,
    homeAdvantage: 0.13,
    order: 2
  },
  SERIEA: {
    name: "Serie A",
    shortName: "Serie A",
    avgGoals: 2.62,
    homeAdvantage: 0.11,
    order: 3
  },
  BUNDESLIGA: {
    name: "Bundesliga",
    shortName: "Bundesliga",
    avgGoals: 3.08,
    homeAdvantage: 0.1,
    order: 4
  },
  UCL: {
    name: "UEFA Champions League",
    shortName: "UCL",
    avgGoals: 2.96,
    homeAdvantage: 0.08,
    order: 5
  },
  WC: {
    name: "FIFA World Cup 2026",
    shortName: "WC",
    avgGoals: 2.65,
    homeAdvantage: 0.04,
    order: 0
  }
};

const statusLabels = {
  upcoming: "Upcoming",
  live: "Live",
  halftime: "Halftime",
  finished: "Finished"
};

const WORLD_CUP_PICK_STORAGE_KEY = "goaliq-worldcup-picks";

const worldCupGroups = [
  worldCupGroup("A", [
    worldCupTeam("MEX", "Mexico", 1780),
    worldCupTeam("RSA", "South Africa", 1640),
    worldCupTeam("KOR", "South Korea", 1742),
    worldCupTeam("CZE", "Czechia", 1698)
  ]),
  worldCupGroup("B", [
    worldCupTeam("CAN", "Canada", 1710),
    worldCupTeam("BIH", "Bosnia and Herzegovina", 1660),
    worldCupTeam("QAT", "Qatar", 1654),
    worldCupTeam("SUI", "Switzerland", 1810)
  ]),
  worldCupGroup("C", [
    worldCupTeam("BRA", "Brazil", 1905),
    worldCupTeam("MAR", "Morocco", 1825),
    worldCupTeam("HAI", "Haiti", 1585),
    worldCupTeam("SCO", "Scotland", 1725)
  ]),
  worldCupGroup("D", [
    worldCupTeam("USA", "United States", 1775),
    worldCupTeam("PAR", "Paraguay", 1705),
    worldCupTeam("AUS", "Australia", 1712),
    worldCupTeam("TUR", "Turkey", 1768)
  ]),
  worldCupGroup("E", [
    worldCupTeam("GER", "Germany", 1880),
    worldCupTeam("CUR", "Curacao", 1580),
    worldCupTeam("CIV", "Ivory Coast", 1718),
    worldCupTeam("ECU", "Ecuador", 1788)
  ]),
  worldCupGroup("F", [
    worldCupTeam("NED", "Netherlands", 1868),
    worldCupTeam("JPN", "Japan", 1790),
    worldCupTeam("SWE", "Sweden", 1722),
    worldCupTeam("TUN", "Tunisia", 1688)
  ]),
  worldCupGroup("G", [
    worldCupTeam("BEL", "Belgium", 1848),
    worldCupTeam("EGY", "Egypt", 1715),
    worldCupTeam("IRN", "Iran", 1735),
    worldCupTeam("NZL", "New Zealand", 1568)
  ]),
  worldCupGroup("H", [
    worldCupTeam("ESP", "Spain", 1930),
    worldCupTeam("CPV", "Cape Verde", 1604),
    worldCupTeam("KSA", "Saudi Arabia", 1648),
    worldCupTeam("URU", "Uruguay", 1835)
  ]),
  worldCupGroup("I", [
    worldCupTeam("FRA", "France", 1915),
    worldCupTeam("SEN", "Senegal", 1772),
    worldCupTeam("IRQ", "Iraq", 1638),
    worldCupTeam("NOR", "Norway", 1758)
  ]),
  worldCupGroup("J", [
    worldCupTeam("ARG", "Argentina", 1920),
    worldCupTeam("ALG", "Algeria", 1710),
    worldCupTeam("AUT", "Austria", 1765),
    worldCupTeam("JOR", "Jordan", 1588)
  ]),
  worldCupGroup("K", [
    worldCupTeam("POR", "Portugal", 1888),
    worldCupTeam("COD", "DR Congo", 1658),
    worldCupTeam("UZB", "Uzbekistan", 1646),
    worldCupTeam("COL", "Colombia", 1805)
  ]),
  worldCupGroup("L", [
    worldCupTeam("ENG", "England", 1900),
    worldCupTeam("CRO", "Croatia", 1830),
    worldCupTeam("GHA", "Ghana", 1664),
    worldCupTeam("PAN", "Panama", 1622)
  ])
];

const worldCupRoundOf32 = [
  wcMatch("M73", "Round of 32", "2026-06-28", "Los Angeles", wcSeed("A", 2), wcSeed("B", 2)),
  wcMatch("M74", "Round of 32", "2026-06-28", "Houston", wcSeed("C", 1), wcSeed("F", 2)),
  wcMatch("M75", "Round of 32", "2026-06-29", "Dallas", wcSeed("E", 1), wcThird(["A", "B", "C", "D", "F"])),
  wcMatch("M76", "Round of 32", "2026-06-29", "Mexico City", wcSeed("F", 1), wcSeed("C", 2)),
  wcMatch("M77", "Round of 32", "2026-06-30", "New York New Jersey", wcSeed("E", 2), wcSeed("I", 2)),
  wcMatch("M78", "Round of 32", "2026-06-30", "Atlanta", wcSeed("I", 1), wcThird(["C", "D", "F", "G", "H"])),
  wcMatch("M79", "Round of 32", "2026-07-01", "Monterrey", wcSeed("A", 1), wcThird(["C", "E", "F", "H", "I"])),
  wcMatch("M80", "Round of 32", "2026-07-01", "Vancouver", wcSeed("L", 1), wcThird(["E", "H", "I", "J", "K"])),
  wcMatch("M81", "Round of 32", "2026-07-02", "Seattle", wcSeed("G", 1), wcThird(["A", "E", "H", "I", "J"])),
  wcMatch("M82", "Round of 32", "2026-07-02", "Kansas City", wcSeed("D", 1), wcThird(["B", "E", "F", "I", "J"])),
  wcMatch("M83", "Round of 32", "2026-07-03", "Miami", wcSeed("H", 1), wcSeed("J", 2)),
  wcMatch("M84", "Round of 32", "2026-07-03", "Boston", wcSeed("K", 2), wcSeed("L", 2)),
  wcMatch("M85", "Round of 32", "2026-07-03", "Toronto", wcSeed("B", 1), wcThird(["E", "F", "G", "I", "J"])),
  wcMatch("M86", "Round of 32", "2026-07-03", "San Francisco Bay Area", wcSeed("D", 2), wcSeed("G", 2)),
  wcMatch("M87", "Round of 32", "2026-07-03", "Philadelphia", wcSeed("J", 1), wcSeed("H", 2)),
  wcMatch("M88", "Round of 32", "2026-07-03", "Dallas", wcSeed("K", 1), wcThird(["D", "E", "I", "J", "L"]))
];

const worldCupLaterRounds = [
  wcRound("round16", "Round of 16", [
    ["M89", "2026-07-04", "Philadelphia", "M73", "M75"],
    ["M90", "2026-07-04", "Houston", "M74", "M77"],
    ["M91", "2026-07-05", "New York New Jersey", "M76", "M78"],
    ["M92", "2026-07-05", "Mexico City", "M79", "M80"],
    ["M93", "2026-07-06", "Dallas", "M83", "M84"],
    ["M94", "2026-07-06", "Seattle", "M81", "M82"],
    ["M95", "2026-07-07", "Atlanta", "M86", "M88"],
    ["M96", "2026-07-07", "Vancouver", "M85", "M87"]
  ]),
  wcRound("quarterfinals", "Quarter-finals", [
    ["M97", "2026-07-09", "Boston", "M89", "M90"],
    ["M98", "2026-07-10", "Los Angeles", "M93", "M94"],
    ["M99", "2026-07-11", "Miami", "M91", "M92"],
    ["M100", "2026-07-11", "Kansas City", "M95", "M96"]
  ]),
  wcRound("semifinals", "Semi-finals", [
    ["M101", "2026-07-14", "Dallas", "M97", "M98"],
    ["M102", "2026-07-15", "Atlanta", "M99", "M100"]
  ]),
  wcRound("final", "Final", [["M104", "2026-07-19", "New York New Jersey", "M101", "M102"]])
];

const todayKey = formatDateKey(new Date());

const seedFixtureMeta = {
  source: "Built-in demo fixture snapshot",
  updatedAt: "2026-04-29",
  note: "Sample today, live, finished, and upcoming fixtures. Import JSON to replace with a real schedule."
};

const teams = {
  MUN: makeTeam("MUN", "Manchester United", "MUN", 1764, "Old Trafford", {
    attack: [1.45, 13.2, 4.8, 2.4, 1.52],
    defense: [1.28, 31, 1.42, 2.1],
    form: [
      ["EPL", "Tottenham Hotspur", "A", 2, 2],
      ["EPL", "Everton", "H", 1, 0],
      ["EPL", "Liverpool", "A", 0, 2],
      ["EPL", "Newcastle United", "H", 3, 1],
      ["EPL", "Aston Villa", "A", 1, 1]
    ]
  }),
  CHE: makeTeam("CHE", "Chelsea", "CHE", 1818, "Stamford Bridge", {
    attack: [1.72, 14.8, 5.4, 2.9, 1.76],
    defense: [1.22, 36, 1.28, 2.0],
    form: [
      ["EPL", "Arsenal", "H", 1, 1],
      ["EPL", "Bournemouth", "A", 2, 0],
      ["EPL", "Manchester City", "H", 1, 2],
      ["EPL", "Brighton & Hove Albion", "A", 3, 1],
      ["EPL", "Crystal Palace", "H", 2, 2]
    ]
  }),
  ARS: makeTeam("ARS", "Arsenal", "ARS", 1908, "Emirates Stadium", {
    attack: [2.05, 15.4, 6.0, 3.3, 2.03],
    defense: [0.86, 48, 0.94, 1.7],
    form: [
      ["EPL", "Chelsea", "A", 1, 1],
      ["EPL", "West Ham United", "H", 3, 0],
      ["EPL", "Manchester City", "A", 1, 1],
      ["EPL", "Fulham", "H", 2, 0],
      ["EPL", "Tottenham Hotspur", "A", 2, 1]
    ]
  }),
  LIV: makeTeam("LIV", "Liverpool", "LIV", 1896, "Anfield", {
    attack: [2.12, 16.2, 6.2, 3.5, 2.11],
    defense: [0.98, 43, 1.04, 1.9],
    form: [
      ["EPL", "Manchester United", "H", 2, 0],
      ["EPL", "Newcastle United", "A", 2, 2],
      ["EPL", "Aston Villa", "H", 3, 1],
      ["EPL", "Everton", "A", 1, 0],
      ["EPL", "Brighton & Hove Albion", "H", 2, 1]
    ]
  }),
  MCI: makeTeam("MCI", "Manchester City", "MCI", 1902, "Etihad Stadium", {
    attack: [2.2, 16.5, 6.5, 3.7, 2.18],
    defense: [0.92, 45, 0.98, 1.5],
    form: [
      ["EPL", "Arsenal", "H", 1, 1],
      ["EPL", "Chelsea", "A", 2, 1],
      ["EPL", "Brentford", "H", 3, 0],
      ["EPL", "Liverpool", "A", 1, 2],
      ["EPL", "Wolves", "H", 4, 1]
    ]
  }),
  NEW: makeTeam("NEW", "Newcastle United", "NEW", 1786, "St James' Park", {
    attack: [1.68, 13.9, 5.1, 2.6, 1.69],
    defense: [1.18, 34, 1.2, 2.2],
    form: [
      ["EPL", "Liverpool", "H", 2, 2],
      ["EPL", "Manchester United", "A", 1, 3],
      ["EPL", "Fulham", "H", 2, 0],
      ["EPL", "Everton", "A", 1, 1],
      ["EPL", "West Ham United", "H", 3, 1]
    ]
  }),
  TOT: makeTeam("TOT", "Tottenham Hotspur", "TOT", 1794, "Tottenham Hotspur Stadium", {
    attack: [1.81, 14.2, 5.3, 2.7, 1.78],
    defense: [1.34, 29, 1.42, 2.4],
    form: [
      ["EPL", "Manchester United", "H", 2, 2],
      ["EPL", "Arsenal", "H", 1, 2],
      ["EPL", "Bournemouth", "A", 3, 2],
      ["EPL", "Aston Villa", "A", 1, 1],
      ["EPL", "Brentford", "H", 2, 0]
    ]
  }),
  AVL: makeTeam("AVL", "Aston Villa", "AVL", 1772, "Villa Park", {
    attack: [1.63, 12.7, 4.7, 2.3, 1.57],
    defense: [1.16, 35, 1.18, 1.9],
    form: [
      ["EPL", "Liverpool", "A", 1, 3],
      ["EPL", "Manchester United", "H", 1, 1],
      ["EPL", "Brighton & Hove Albion", "A", 2, 1],
      ["EPL", "Tottenham Hotspur", "H", 1, 1],
      ["EPL", "Everton", "A", 2, 0]
    ]
  }),
  BHA: makeTeam("BHA", "Brighton & Hove Albion", "BHA", 1728, "Amex Stadium", {
    attack: [1.42, 13.5, 4.5, 2.1, 1.44],
    defense: [1.32, 28, 1.36, 1.8],
    form: [
      ["EPL", "Chelsea", "H", 1, 3],
      ["EPL", "Liverpool", "A", 1, 2],
      ["EPL", "Aston Villa", "H", 1, 2],
      ["EPL", "Fulham", "A", 2, 2],
      ["EPL", "Crystal Palace", "H", 2, 0]
    ]
  }),
  RMA: makeTeam("RMA", "Real Madrid", "RMA", 1920, "Santiago Bernabeu", {
    attack: [2.08, 15.1, 5.9, 3.2, 2.0],
    defense: [0.88, 50, 0.91, 1.8],
    form: [
      ["LALIGA", "Barcelona", "H", 2, 1],
      ["LALIGA", "Villarreal", "A", 2, 0],
      ["UCL", "Manchester City", "A", 1, 1],
      ["LALIGA", "Real Sociedad", "H", 3, 0],
      ["LALIGA", "Atletico Madrid", "A", 1, 1]
    ]
  }),
  BAR: makeTeam("BAR", "Barcelona", "BAR", 1898, "Estadi Olimpic Lluis Companys", {
    attack: [2.01, 15.8, 6.1, 3.4, 2.04],
    defense: [1.02, 42, 1.05, 1.9],
    form: [
      ["LALIGA", "Real Madrid", "A", 1, 2],
      ["LALIGA", "Sevilla", "H", 3, 1],
      ["LALIGA", "Atletico Madrid", "H", 2, 0],
      ["UCL", "Inter", "A", 1, 1],
      ["LALIGA", "Real Betis", "A", 2, 2]
    ]
  }),
  ATM: makeTeam("ATM", "Atletico Madrid", "ATM", 1848, "Metropolitano Stadium", {
    attack: [1.62, 12.8, 4.8, 2.4, 1.58],
    defense: [0.96, 47, 0.98, 2.3],
    form: [
      ["LALIGA", "Barcelona", "A", 0, 2],
      ["LALIGA", "Real Madrid", "H", 1, 1],
      ["LALIGA", "Valencia", "H", 2, 0],
      ["LALIGA", "Villarreal", "A", 1, 1],
      ["LALIGA", "Real Sociedad", "H", 1, 0]
    ]
  }),
  RSO: makeTeam("RSO", "Real Sociedad", "RSO", 1738, "Reale Arena", {
    attack: [1.34, 12.4, 4.3, 2.0, 1.36],
    defense: [1.08, 39, 1.11, 1.7],
    form: [
      ["LALIGA", "Real Madrid", "A", 0, 3],
      ["LALIGA", "Atletico Madrid", "A", 0, 1],
      ["LALIGA", "Villarreal", "H", 2, 1],
      ["LALIGA", "Sevilla", "A", 1, 1],
      ["LALIGA", "Valencia", "H", 1, 0]
    ]
  }),
  INT: makeTeam("INT", "Inter", "INT", 1892, "San Siro", {
    attack: [2.0, 14.9, 5.7, 3.0, 1.95],
    defense: [0.78, 54, 0.82, 1.6],
    form: [
      ["SERIEA", "Juventus", "A", 1, 1],
      ["SERIEA", "Roma", "H", 2, 0],
      ["UCL", "Barcelona", "H", 1, 1],
      ["SERIEA", "Lazio", "A", 2, 1],
      ["SERIEA", "Napoli", "H", 1, 0]
    ]
  }),
  JUV: makeTeam("JUV", "Juventus", "JUV", 1828, "Allianz Stadium", {
    attack: [1.46, 12.5, 4.5, 2.1, 1.42],
    defense: [0.92, 49, 0.96, 2.0],
    form: [
      ["SERIEA", "Inter", "H", 1, 1],
      ["SERIEA", "AC Milan", "A", 1, 0],
      ["SERIEA", "Bologna", "H", 2, 1],
      ["SERIEA", "Roma", "A", 0, 0],
      ["SERIEA", "Lazio", "H", 2, 0]
    ]
  }),
  ACM: makeTeam("ACM", "AC Milan", "ACM", 1820, "San Siro", {
    attack: [1.7, 13.8, 5.0, 2.5, 1.68],
    defense: [1.1, 38, 1.14, 2.1],
    form: [
      ["SERIEA", "Juventus", "H", 0, 1],
      ["SERIEA", "Roma", "A", 2, 2],
      ["SERIEA", "Napoli", "A", 1, 1],
      ["SERIEA", "Torino", "H", 2, 0],
      ["SERIEA", "Fiorentina", "H", 3, 1]
    ]
  }),
  ROM: makeTeam("ROM", "Roma", "ROM", 1752, "Stadio Olimpico", {
    attack: [1.48, 12.9, 4.6, 2.2, 1.45],
    defense: [1.14, 36, 1.19, 2.4],
    form: [
      ["SERIEA", "Inter", "A", 0, 2],
      ["SERIEA", "AC Milan", "H", 2, 2],
      ["SERIEA", "Juventus", "H", 0, 0],
      ["SERIEA", "Lazio", "A", 1, 0],
      ["SERIEA", "Bologna", "H", 1, 1]
    ]
  }),
  BAY: makeTeam("BAY", "Bayern Munich", "BAY", 1910, "Allianz Arena", {
    attack: [2.35, 17.1, 6.8, 3.9, 2.28],
    defense: [0.98, 42, 1.02, 1.6],
    form: [
      ["BUNDESLIGA", "Borussia Dortmund", "A", 2, 2],
      ["BUNDESLIGA", "RB Leipzig", "H", 3, 1],
      ["UCL", "Paris Saint-Germain", "A", 1, 0],
      ["BUNDESLIGA", "Freiburg", "H", 4, 0],
      ["BUNDESLIGA", "Bayer Leverkusen", "A", 1, 1]
    ]
  }),
  BVB: makeTeam("BVB", "Borussia Dortmund", "BVB", 1828, "Signal Iduna Park", {
    attack: [1.86, 14.4, 5.4, 2.8, 1.82],
    defense: [1.22, 33, 1.3, 1.9],
    form: [
      ["BUNDESLIGA", "Bayern Munich", "H", 2, 2],
      ["BUNDESLIGA", "Stuttgart", "A", 1, 2],
      ["BUNDESLIGA", "Wolfsburg", "H", 3, 0],
      ["UCL", "Benfica", "A", 2, 1],
      ["BUNDESLIGA", "Mainz", "H", 1, 1]
    ]
  }),
  LEV: makeTeam("LEV", "Bayer Leverkusen", "LEV", 1884, "BayArena", {
    attack: [2.08, 15.7, 6.0, 3.3, 2.06],
    defense: [0.9, 48, 0.94, 1.8],
    form: [
      ["BUNDESLIGA", "Bayern Munich", "H", 1, 1],
      ["BUNDESLIGA", "RB Leipzig", "A", 2, 1],
      ["BUNDESLIGA", "Freiburg", "A", 2, 0],
      ["UCL", "Atletico Madrid", "H", 1, 0],
      ["BUNDESLIGA", "Union Berlin", "H", 3, 1]
    ]
  }),
  RBL: makeTeam("RBL", "RB Leipzig", "RBL", 1818, "Red Bull Arena", {
    attack: [1.82, 14.1, 5.2, 2.7, 1.79],
    defense: [1.06, 40, 1.09, 1.7],
    form: [
      ["BUNDESLIGA", "Bayern Munich", "A", 1, 3],
      ["BUNDESLIGA", "Bayer Leverkusen", "H", 1, 2],
      ["BUNDESLIGA", "Mainz", "A", 2, 0],
      ["BUNDESLIGA", "Wolfsburg", "H", 2, 1],
      ["BUNDESLIGA", "Stuttgart", "A", 1, 1]
    ]
  }),
  PSG: makeTeam("PSG", "Paris Saint-Germain", "PSG", 1878, "Parc des Princes", {
    attack: [2.15, 16.4, 6.3, 3.5, 2.13],
    defense: [0.96, 44, 1.0, 1.8],
    form: [
      ["UCL", "Bayern Munich", "H", 0, 1],
      ["UCL", "Benfica", "A", 2, 1],
      ["UCL", "Inter", "A", 1, 1],
      ["UCL", "Barcelona", "H", 2, 2],
      ["UCL", "Porto", "H", 3, 0]
    ]
  }),
  BEN: makeTeam("BEN", "Benfica", "BEN", 1768, "Estadio da Luz", {
    attack: [1.74, 14.0, 5.1, 2.5, 1.7],
    defense: [1.12, 37, 1.18, 2.0],
    form: [
      ["UCL", "Paris Saint-Germain", "H", 1, 2],
      ["UCL", "Borussia Dortmund", "H", 1, 2],
      ["UCL", "Ajax", "A", 2, 0],
      ["UCL", "Celtic", "H", 3, 1],
      ["UCL", "Inter", "A", 0, 1]
    ]
  }),
  LEE: quickTeam("LEE", "Leeds", "LEE", 1588, "Elland Road", "EPL"),
  BUR: quickTeam("BUR", "Burnley", "BUR", 1568, "Turf Moor", "EPL"),
  BRE: quickTeam("BRE", "Brentford", "BRE", 1665, "Gtech Community Stadium", "EPL"),
  WHU: quickTeam("WHU", "West Ham", "WHU", 1688, "London Stadium", "EPL"),
  WOL: quickTeam("WOL", "Wolves", "WOL", 1638, "Molineux", "EPL"),
  SUN: quickTeam("SUN", "Sunderland", "SUN", 1576, "Stadium of Light", "EPL"),
  FUL: quickTeam("FUL", "Fulham", "FUL", 1656, "Craven Cottage", "EPL"),
  BOU: quickTeam("BOU", "Bournemouth", "BOU", 1654, "Vitality Stadium", "EPL"),
  CRY: quickTeam("CRY", "Crystal Palace", "PAL", 1678, "Selhurst Park", "EPL"),
  NFO: quickTeam("NFO", "Nottingham Forest", "NFO", 1630, "City Ground", "EPL"),
  EVE: quickTeam("EVE", "Everton", "EVE", 1648, "Hill Dickinson Stadium", "EPL"),
  ALV: quickTeam("ALV", "Alaves", "ALA", 1588, "Mendizorrotza", "LALIGA"),
  ATH: quickTeam("ATH", "Athletic Club", "ATH", 1776, "San Mames", "LALIGA"),
  CEL: quickTeam("CEL", "Celta Vigo", "CEL", 1642, "Balaidos", "LALIGA"),
  ELC: quickTeam("ELC", "Elche", "ELC", 1562, "Martinez Valero", "LALIGA"),
  ESP: quickTeam("ESP", "Espanyol", "ESP", 1598, "RCDE Stadium", "LALIGA"),
  GET: quickTeam("GET", "Getafe", "GET", 1624, "Coliseum", "LALIGA"),
  GIR: quickTeam("GIR", "Girona", "GIR", 1608, "Montilivi", "LALIGA"),
  MLL: quickTeam("MLL", "Mallorca", "MLL", 1614, "Son Moix", "LALIGA"),
  OSA: quickTeam("OSA", "Osasuna", "OSA", 1634, "El Sadar", "LALIGA"),
  RAY: quickTeam("RAY", "Rayo Vallecano", "RAY", 1618, "Vallecas", "LALIGA"),
  BET: quickTeam("BET", "Real Betis", "BET", 1718, "Benito Villamarin", "LALIGA"),
  OVI: quickTeam("OVI", "Real Oviedo", "OVI", 1558, "Carlos Tartiere", "LALIGA"),
  SEV: quickTeam("SEV", "Sevilla", "SEV", 1686, "Ramon Sanchez-Pizjuan", "LALIGA"),
  VAL: quickTeam("VAL", "Valencia", "VAL", 1662, "Mestalla", "LALIGA"),
  VIL: quickTeam("VIL", "Villarreal", "VIL", 1748, "Estadio de la Ceramica", "LALIGA"),
  LEN: quickTeam("LEN", "Levante", "LEV", 1564, "Ciutat de Valencia", "LALIGA"),
  ATA: quickTeam("ATA", "Atalanta", "ATA", 1808, "Gewiss Stadium", "SERIEA"),
  GEN: quickTeam("GEN", "Genoa", "GEN", 1632, "Luigi Ferraris", "SERIEA"),
  BOL: quickTeam("BOL", "Bologna", "BOL", 1718, "Stadio Renato Dall'Ara", "SERIEA"),
  CAG: quickTeam("CAG", "Cagliari", "CAG", 1604, "Unipol Domus", "SERIEA"),
  COM: quickTeam("COM", "Como", "COM", 1582, "Stadio Giuseppe Sinigaglia", "SERIEA"),
  NAP: quickTeam("NAP", "Napoli", "NAP", 1846, "Stadio Diego Armando Maradona", "SERIEA"),
  CRE: quickTeam("CRE", "Cremonese", "CRE", 1558, "Stadio Giovanni Zini", "SERIEA"),
  LAZ: quickTeam("LAZ", "Lazio", "LAZ", 1738, "Stadio Olimpico", "SERIEA"),
  PAR: quickTeam("PAR", "Parma", "PAR", 1588, "Stadio Ennio Tardini", "SERIEA"),
  VER: quickTeam("VER", "Verona", "VER", 1576, "Stadio Marcantonio Bentegodi", "SERIEA"),
  PIS: quickTeam("PIS", "Pisa", "PIS", 1556, "Arena Garibaldi", "SERIEA"),
  LEC: quickTeam("LEC", "Lecce", "LEC", 1592, "Via del Mare", "SERIEA"),
  FIO: quickTeam("FIO", "Fiorentina", "FIO", 1724, "Artemio Franchi", "SERIEA"),
  SAS: quickTeam("SAS", "Sassuolo", "SAS", 1570, "Mapei Stadium", "SERIEA"),
  UDI: quickTeam("UDI", "Udinese", "UDI", 1642, "Bluenergy Stadium", "SERIEA"),
  TOR: quickTeam("TOR", "Torino", "TOR", 1666, "Stadio Olimpico Grande Torino", "SERIEA"),
  HEI: quickTeam("HEI", "Heidenheim", "HEI", 1608, "Voith-Arena", "BUNDESLIGA"),
  FRA: quickTeam("FRA", "Eintracht Frankfurt", "SGE", 1738, "Deutsche Bank Park", "BUNDESLIGA"),
  HSV: quickTeam("HSV", "Hamburger SV", "HSV", 1578, "Volksparkstadion", "BUNDESLIGA"),
  HOF: quickTeam("HOF", "Hoffenheim", "HOF", 1624, "PreZero Arena", "BUNDESLIGA"),
  STU: quickTeam("STU", "Stuttgart", "VFB", 1768, "MHP Arena", "BUNDESLIGA"),
  UNI: quickTeam("UNI", "Union Berlin", "FCU", 1628, "Stadion An der Alten Forsterei", "BUNDESLIGA"),
  KOL: quickTeam("KOL", "Koln", "KOE", 1572, "RheinEnergieStadion", "BUNDESLIGA"),
  WER: quickTeam("WER", "Werder Bremen", "SVW", 1652, "Weserstadion", "BUNDESLIGA"),
  AUG: quickTeam("AUG", "Augsburg", "FCA", 1636, "WWK Arena", "BUNDESLIGA"),
  STP: quickTeam("STP", "St. Pauli", "STP", 1582, "Millerntor-Stadion", "BUNDESLIGA"),
  MAI: quickTeam("MAI", "Mainz", "M05", 1648, "MEWA Arena", "BUNDESLIGA"),
  BMG: quickTeam("BMG", "Borussia Monchengladbach", "BMG", 1668, "Borussia-Park", "BUNDESLIGA"),
  FRE: quickTeam("FRE", "Freiburg", "SCF", 1682, "Europa-Park Stadion", "BUNDESLIGA"),
  WOB: quickTeam("WOB", "Wolfsburg", "WOB", 1686, "Volkswagen Arena", "BUNDESLIGA")
};

const matches = [
  makeMatch("today-epl-mun-che", 0, "EPL", "18:30", "MUN", "CHE", "live", "Old Trafford", { home: 1, away: 1, minute: 67 }),
  makeMatch("today-epl-ars-liv", 0, "EPL", "20:45", "ARS", "LIV", "upcoming", "Emirates Stadium"),
  makeMatch("today-laliga-rma-bar", 0, "LALIGA", "16:00", "RMA", "BAR", "finished", "Santiago Bernabeu", { home: 2, away: 1 }),
  makeMatch("today-seriea-int-juv", 0, "SERIEA", "17:15", "INT", "JUV", "halftime", "San Siro", { home: 0, away: 0, minute: 45 }),
  makeMatch("today-bundesliga-bay-bvb", 0, "BUNDESLIGA", "15:30", "BAY", "BVB", "finished", "Allianz Arena", { home: 3, away: 2 }),
  makeMatch("today-ucl-psg-atm", 0, "UCL", "22:00", "PSG", "ATM", "upcoming", "Parc des Princes", null, "Semi-final watchlist"),
  makeMatch("ucl-psg-bay-1", 1, "UCL", "00:30", "PSG", "BAY", "upcoming", "Parc des Princes", null, "Semi-final - Leg 1 of 2"),
  makeMatch("ucl-atm-ars-1", 2, "UCL", "00:30", "ATM", "ARS", "upcoming", "Metropolitano Stadium", null, "Semi-final - Leg 1 of 2"),
  makeMatch("epl-lee-bur", 4, "EPL", "00:30", "LEE", "BUR", "upcoming", "Elland Road"),
  makeMatch("epl-bre-whu", 4, "EPL", "19:30", "BRE", "WHU", "upcoming", "Gtech Community Stadium"),
  makeMatch("epl-wol-sun", 4, "EPL", "19:30", "WOL", "SUN", "upcoming", "Molineux"),
  makeMatch("epl-new-bha", 4, "EPL", "19:30", "NEW", "BHA", "upcoming", "St James' Park"),
  makeMatch("epl-ars-ful", 4, "EPL", "22:00", "ARS", "FUL", "upcoming", "Emirates Stadium"),
  makeMatch("bund-bay-hei", 4, "BUNDESLIGA", "19:00", "BAY", "HEI", "upcoming", "Allianz Arena"),
  makeMatch("bund-fra-hsv", 4, "BUNDESLIGA", "19:00", "FRA", "HSV", "upcoming", "Deutsche Bank Park"),
  makeMatch("bund-hof-stu", 4, "BUNDESLIGA", "19:00", "HOF", "STU", "upcoming", "PreZero Arena"),
  makeMatch("bund-uni-kol", 4, "BUNDESLIGA", "19:00", "UNI", "KOL", "upcoming", "Stadion An der Alten Forsterei"),
  makeMatch("bund-wer-aug", 4, "BUNDESLIGA", "19:00", "WER", "AUG", "upcoming", "Weserstadion"),
  makeMatch("bund-lev-rbl", 4, "BUNDESLIGA", "22:00", "LEV", "RBL", "upcoming", "BayArena"),
  makeMatch("epl-bou-cry", 5, "EPL", "18:30", "BOU", "CRY", "upcoming", "Vitality Stadium"),
  makeMatch("epl-mun-liv", 5, "EPL", "20:00", "MUN", "LIV", "upcoming", "Old Trafford"),
  makeMatch("epl-avl-tot", 5, "EPL", "23:30", "AVL", "TOT", "upcoming", "Villa Park"),
  makeMatch("bund-stp-mai", 5, "BUNDESLIGA", "19:00", "STP", "MAI", "upcoming", "Millerntor-Stadion"),
  makeMatch("bund-bmg-bvb", 5, "BUNDESLIGA", "21:00", "BMG", "BVB", "upcoming", "Borussia-Park"),
  makeMatch("bund-fre-wob", 5, "BUNDESLIGA", "23:00", "FRE", "WOB", "upcoming", "Europa-Park Stadion"),
  makeMatch("laliga-cel-elc", 5, "LALIGA", "17:30", "CEL", "ELC", "upcoming", "Balaidos"),
  makeMatch("laliga-get-ray", 5, "LALIGA", "19:45", "GET", "RAY", "upcoming", "Coliseum"),
  makeMatch("laliga-esp-rma", 5, "LALIGA", "21:30", "ESP", "RMA", "upcoming", "RCDE Stadium"),
  makeMatch("laliga-osa-bar", 5, "LALIGA", "21:30", "OSA", "BAR", "upcoming", "El Sadar"),
  makeMatch("laliga-val-atm", 5, "LALIGA", "21:30", "VAL", "ATM", "upcoming", "Mestalla"),
  makeMatch("laliga-bet-ovi", 5, "LALIGA", "22:00", "BET", "OVI", "upcoming", "Benito Villamarin"),
  makeMatch("seriea-ata-gen", 5, "SERIEA", "18:30", "ATA", "GEN", "upcoming", "Gewiss Stadium"),
  makeMatch("seriea-bol-cag", 5, "SERIEA", "18:30", "BOL", "CAG", "upcoming", "Stadio Renato Dall'Ara"),
  makeMatch("seriea-com-nap", 5, "SERIEA", "18:30", "COM", "NAP", "upcoming", "Stadio Giuseppe Sinigaglia"),
  makeMatch("seriea-cre-laz", 5, "SERIEA", "18:30", "CRE", "LAZ", "upcoming", "Stadio Giovanni Zini"),
  makeMatch("seriea-int-par", 5, "SERIEA", "18:30", "INT", "PAR", "upcoming", "San Siro"),
  makeMatch("seriea-juv-ver", 5, "SERIEA", "18:30", "JUV", "VER", "upcoming", "Allianz Stadium"),
  makeMatch("seriea-pis-lec", 5, "SERIEA", "18:30", "PIS", "LEC", "upcoming", "Arena Garibaldi"),
  makeMatch("seriea-rom-fio", 5, "SERIEA", "18:30", "ROM", "FIO", "upcoming", "Stadio Olimpico"),
  makeMatch("seriea-sas-acm", 5, "SERIEA", "18:30", "SAS", "ACM", "upcoming", "Mapei Stadium"),
  makeMatch("seriea-udi-tor", 5, "SERIEA", "18:30", "UDI", "TOR", "upcoming", "Bluenergy Stadium"),
  makeMatch("epl-che-nfo", 6, "EPL", "19:30", "CHE", "NFO", "upcoming", "Stamford Bridge"),
  makeMatch("epl-eve-mci", 7, "EPL", "00:30", "EVE", "MCI", "upcoming", "Hill Dickinson Stadium"),
  makeMatch("laliga-sev-rso", 7, "LALIGA", "00:30", "SEV", "RSO", "upcoming", "Ramon Sanchez-Pizjuan"),
  makeMatch("ucl-ars-atm-2", 8, "UCL", "00:30", "ARS", "ATM", "upcoming", "Emirates Stadium", null, "Semi-final - Leg 2 of 2"),
  makeMatch("ucl-bay-psg-2", 9, "UCL", "00:30", "BAY", "PSG", "upcoming", "Allianz Arena", null, "Semi-final - Leg 2 of 2")
];

const seedMatches = matches.map(cloneMatch);
const seedTeams = cloneTeamMap(teams);
let fixtureMeta = { ...seedFixtureMeta };

const headToHead = {
  [pairKey("MUN", "CHE")]: [
    meeting(-56, "EPL", "CHE", "MUN", 1, 1, "Stamford Bridge"),
    meeting(-220, "EPL", "MUN", "CHE", 2, 1, "Old Trafford"),
    meeting(-394, "EPL", "CHE", "MUN", 0, 0, "Stamford Bridge"),
    meeting(-570, "EPL", "MUN", "CHE", 1, 2, "Old Trafford"),
    meeting(-740, "EPL", "CHE", "MUN", 1, 1, "Stamford Bridge")
  ],
  [pairKey("ARS", "LIV")]: [
    meeting(-40, "EPL", "LIV", "ARS", 2, 1, "Anfield"),
    meeting(-210, "EPL", "ARS", "LIV", 2, 0, "Emirates Stadium"),
    meeting(-420, "EPL", "LIV", "ARS", 1, 1, "Anfield"),
    meeting(-610, "EPL", "ARS", "LIV", 3, 2, "Emirates Stadium")
  ],
  [pairKey("RMA", "BAR")]: [
    meeting(-20, "LALIGA", "RMA", "BAR", 2, 1, "Santiago Bernabeu"),
    meeting(-210, "LALIGA", "BAR", "RMA", 1, 2, "Estadi Olimpic Lluis Companys"),
    meeting(-390, "LALIGA", "RMA", "BAR", 1, 1, "Santiago Bernabeu"),
    meeting(-565, "LALIGA", "BAR", "RMA", 2, 0, "Camp Nou")
  ],
  [pairKey("INT", "JUV")]: [
    meeting(-31, "SERIEA", "JUV", "INT", 1, 1, "Allianz Stadium"),
    meeting(-205, "SERIEA", "INT", "JUV", 2, 0, "San Siro"),
    meeting(-382, "SERIEA", "JUV", "INT", 0, 1, "Allianz Stadium"),
    meeting(-560, "SERIEA", "INT", "JUV", 1, 1, "San Siro")
  ],
  [pairKey("BAY", "BVB")]: [
    meeting(-22, "BUNDESLIGA", "BVB", "BAY", 2, 2, "Signal Iduna Park"),
    meeting(-205, "BUNDESLIGA", "BAY", "BVB", 3, 1, "Allianz Arena"),
    meeting(-389, "BUNDESLIGA", "BVB", "BAY", 0, 2, "Signal Iduna Park"),
    meeting(-560, "BUNDESLIGA", "BAY", "BVB", 4, 2, "Allianz Arena")
  ],
  [pairKey("AVL", "BHA")]: [
    meeting(-80, "EPL", "BHA", "AVL", 1, 2, "Amex Stadium"),
    meeting(-270, "EPL", "AVL", "BHA", 2, 0, "Villa Park"),
    meeting(-420, "EPL", "BHA", "AVL", 2, 2, "Amex Stadium")
  ],
  [pairKey("TOT", "NEW")]: [
    meeting(-60, "EPL", "NEW", "TOT", 2, 2, "St James' Park"),
    meeting(-250, "EPL", "TOT", "NEW", 1, 1, "Tottenham Hotspur Stadium"),
    meeting(-430, "EPL", "NEW", "TOT", 3, 1, "St James' Park")
  ],
  [pairKey("ACM", "ROM")]: [
    meeting(-65, "SERIEA", "ROM", "ACM", 2, 2, "Stadio Olimpico"),
    meeting(-240, "SERIEA", "ACM", "ROM", 2, 1, "San Siro"),
    meeting(-415, "SERIEA", "ROM", "ACM", 1, 1, "Stadio Olimpico")
  ],
  [pairKey("LEV", "RBL")]: [
    meeting(-44, "BUNDESLIGA", "RBL", "LEV", 1, 2, "Red Bull Arena"),
    meeting(-220, "BUNDESLIGA", "LEV", "RBL", 2, 0, "BayArena"),
    meeting(-390, "BUNDESLIGA", "RBL", "LEV", 1, 1, "Red Bull Arena")
  ],
  [pairKey("MCI", "RMA")]: [
    meeting(-22, "UCL", "RMA", "MCI", 1, 1, "Santiago Bernabeu"),
    meeting(-370, "UCL", "MCI", "RMA", 4, 0, "Etihad Stadium"),
    meeting(-378, "UCL", "RMA", "MCI", 1, 1, "Santiago Bernabeu"),
    meeting(-720, "UCL", "RMA", "MCI", 3, 1, "Santiago Bernabeu")
  ],
  [pairKey("PSG", "BEN")]: [
    meeting(-35, "UCL", "BEN", "PSG", 1, 2, "Estadio da Luz"),
    meeting(-410, "UCL", "PSG", "BEN", 1, 1, "Parc des Princes"),
    meeting(-430, "UCL", "BEN", "PSG", 1, 1, "Estadio da Luz")
  ],
  [pairKey("CHE", "MCI")]: [
    meeting(-90, "EPL", "MCI", "CHE", 2, 1, "Etihad Stadium"),
    meeting(-260, "EPL", "CHE", "MCI", 1, 1, "Stamford Bridge"),
    meeting(-430, "EPL", "MCI", "CHE", 1, 0, "Etihad Stadium")
  ],
  [pairKey("ATM", "RSO")]: [
    meeting(-120, "LALIGA", "RSO", "ATM", 0, 1, "Reale Arena"),
    meeting(-310, "LALIGA", "ATM", "RSO", 1, 0, "Metropolitano Stadium"),
    meeting(-500, "LALIGA", "RSO", "ATM", 1, 1, "Reale Arena")
  ],
  [pairKey("BAR", "INT")]: [
    meeting(-75, "UCL", "INT", "BAR", 1, 1, "San Siro"),
    meeting(-430, "UCL", "BAR", "INT", 3, 3, "Camp Nou"),
    meeting(-445, "UCL", "INT", "BAR", 1, 0, "San Siro")
  ]
};

const selectors = {
  headerMatchCount: document.querySelector("#headerMatchCount"),
  dateInput: document.querySelector("#dateInput"),
  searchInput: document.querySelector("#searchInput"),
  fixtureSourceText: document.querySelector("#fixtureSourceText"),
  fixtureJsonFile: document.querySelector("#fixtureJsonFile"),
  fixtureUrlInput: document.querySelector("#fixtureUrlInput"),
  loadFixtureUrlButton: document.querySelector("#loadFixtureUrlButton"),
  loadLiveFeedButton: document.querySelector("#loadLiveFeedButton"),
  exportFixturesButton: document.querySelector("#exportFixturesButton"),
  resetFixturesButton: document.querySelector("#resetFixturesButton"),
  fixtureImportStatus: document.querySelector("#fixtureImportStatus"),
  loadingState: document.querySelector("#loadingState"),
  emptyState: document.querySelector("#emptyState"),
  matchGroups: document.querySelector("#matchGroups"),
  homeView: document.querySelector("#homeView"),
  bracketView: document.querySelector("#bracketView"),
  bracketContent: document.querySelector("#bracketContent"),
  detailView: document.querySelector("#detailView"),
  detailStatus: document.querySelector("#detailStatus"),
  detailLeague: document.querySelector("#detailLeague"),
  detailTitle: document.querySelector("#detailTitle"),
  detailMeta: document.querySelector("#detailMeta"),
  scorePredictionLabel: document.querySelector("#scorePredictionLabel"),
  predictedScore: document.querySelector("#predictedScore"),
  probabilityPanelTitle: document.querySelector("#probabilityPanelTitle"),
  confidenceLevel: document.querySelector("#confidenceLevel"),
  probabilityCards: document.querySelector("#probabilityCards"),
  overviewRows: document.querySelector("#overviewRows"),
  extraPredictions: document.querySelector("#extraPredictions"),
  extraPredictionsTitle: document.querySelector("#extraPredictionsTitle"),
  mostLikelyResult: document.querySelector("#mostLikelyResult"),
  formGrid: document.querySelector("#formGrid"),
  attackingStats: document.querySelector("#attackingStats"),
  defensiveStats: document.querySelector("#defensiveStats"),
  h2hSummary: document.querySelector("#h2hSummary"),
  h2hRows: document.querySelector("#h2hRows")
};

const state = {
  activeView: "today",
  selectedDate: todayKey,
  search: "",
  selectedMatchId: null,
  selectedBracketMatchId: null,
  bracketUserPicks: loadWorldCupPicks(),
  detailTab: "overview",
  renderTimer: null
};

function quickTeam(id, name, shortName, rating, venue, league) {
  const strength = clamp((rating - 1600) / 300, -0.4, 1.05);
  const opponentsByLeague = {
    EPL: ["Everton", "West Ham", "Fulham", "Brentford", "Bournemouth", "Newcastle United"],
    LALIGA: ["Sevilla", "Valencia", "Getafe", "Osasuna", "Mallorca", "Villarreal"],
    SERIEA: ["Torino", "Udinese", "Bologna", "Lazio", "Genoa", "Fiorentina"],
    BUNDESLIGA: ["Mainz", "Freiburg", "Augsburg", "Wolfsburg", "Werder Bremen", "Union Berlin"],
    UCL: ["Benfica", "Porto", "Ajax", "Celtic", "Sporting CP", "Monaco"]
  };
  const opponents = opponentsByLeague[league] || opponentsByLeague.EPL;
  const offset = id.charCodeAt(0) + id.charCodeAt(id.length - 1);
  const formPattern = [
    rating >= 1760 ? [2, 0] : [1, 1],
    rating >= 1700 ? [2, 1] : [1, 2],
    rating >= 1660 ? [1, 0] : [0, 1],
    rating >= 1620 ? [1, 1] : [0, 2],
    rating >= 1720 ? [3, 1] : [1, 1]
  ];

  return makeTeam(id, name, shortName, rating, venue, {
    attack: [
      clamp(1.25 + strength * 0.62, 0.82, 2.25),
      clamp(11.2 + strength * 4.2, 8.4, 17.4),
      clamp(3.8 + strength * 1.8, 2.6, 6.6),
      clamp(1.6 + strength * 1.3, 0.8, 3.8),
      clamp(1.18 + strength * 0.58, 0.78, 2.15)
    ],
    defense: [
      clamp(1.38 - strength * 0.42, 0.72, 1.88),
      clamp(27 + strength * 18, 16, 56),
      clamp(1.42 - strength * 0.38, 0.78, 1.86),
      clamp(2.4 - strength * 0.35, 1.4, 2.9)
    ],
    form: formPattern.map((score, index) => [
      league,
      opponents[(offset + index) % opponents.length],
      index % 2 === 0 ? "H" : "A",
      score[0],
      score[1]
    ])
  });
}

function makeImportedTeam(id, name, shortName, rating, venue, league) {
  const strength = clamp((rating - 1600) / 300, -0.3, 0.8);

  return {
    id,
    name,
    shortName,
    rating,
    venue,
    attacking: {
      avgGoals: clamp(1.25 + strength * 0.45, 0.85, 2.05),
      shots: clamp(11.2 + strength * 3.4, 8.4, 16.4),
      shotsOnTarget: clamp(3.8 + strength * 1.4, 2.6, 6.1),
      bigChances: clamp(1.6 + strength, 0.8, 3.2),
      xg: clamp(1.18 + strength * 0.45, 0.78, 2.0)
    },
    defensive: {
      goalsConcededAvg: clamp(1.38 - strength * 0.34, 0.82, 1.88),
      cleanSheetPct: clamp(27 + strength * 14, 16, 52),
      xga: clamp(1.42 - strength * 0.3, 0.82, 1.86),
      cards: clamp(2.4 - strength * 0.25, 1.5, 2.9)
    },
    form: []
  };
}

function cloneTeamMap(teamMap) {
  return Object.fromEntries(Object.entries(teamMap).map(([teamId, team]) => [teamId, cloneTeam(team)]));
}

function resetTeamsToSeed() {
  Object.keys(teams).forEach((teamId) => {
    delete teams[teamId];
  });
  Object.entries(seedTeams).forEach(([teamId, team]) => {
    teams[teamId] = cloneTeam(team);
  });
}

function cloneTeam(team) {
  return {
    ...team,
    attacking: { ...team.attacking },
    defensive: { ...team.defensive },
    form: Array.isArray(team.form) ? team.form.map((match) => ({ ...match })) : []
  };
}

function makeTeam(id, name, shortName, rating, venue, data) {
  return {
    id,
    name,
    shortName,
    rating,
    venue,
    attacking: {
      avgGoals: data.attack[0],
      shots: data.attack[1],
      shotsOnTarget: data.attack[2],
      bigChances: data.attack[3],
      xg: data.attack[4]
    },
    defensive: {
      goalsConcededAvg: data.defense[0],
      cleanSheetPct: data.defense[1],
      xga: data.defense[2],
      cards: data.defense[3]
    },
    form: data.form.map((row, index) => ({
      date: formatDateKey(addDays(new Date(), -(index + 1) * 7)),
      competition: row[0],
      opponent: row[1],
      venue: row[2],
      goalsFor: row[3],
      goalsAgainst: row[4]
    }))
  };
}

function makeMatch(id, dateOffset, league, time, homeTeamId, awayTeamId, status, venue, score = null, stage = "") {
  const date = dateKeyFromOffset(dateOffset);
  return {
    id,
    league,
    date,
    time,
    kickoff: `${date}T${time}:00`,
    homeTeamId,
    awayTeamId,
    status,
    venue,
    stage,
    minute: score?.minute || null,
    score: score ? { home: score.home, away: score.away } : null
  };
}

function meeting(dateOffset, competition, homeTeamId, awayTeamId, homeGoals, awayGoals, venue) {
  return {
    date: dateKeyFromOffset(dateOffset),
    competition,
    homeTeamId,
    awayTeamId,
    homeGoals,
    awayGoals,
    venue
  };
}

function getMatchesByDate(date) {
  return matches
    .filter((match) => match.date === date)
    .sort(sortMatches);
}

function getLiveMatches() {
  return matches
    .filter((match) => match.status === "live" || match.status === "halftime")
    .sort(sortMatches);
}

function getUpcomingMatches() {
  return matches
    .filter((match) => match.status === "upcoming" && match.date >= state.selectedDate)
    .sort(sortMatches);
}

function getFinishedMatches() {
  const finishedMatches = matches.filter((match) => match.status === "finished");
  const finishedUpToSelectedDate = finishedMatches.filter((match) => match.date <= state.selectedDate);
  const visibleFinished = finishedUpToSelectedDate.length ? finishedUpToSelectedDate : finishedMatches;
  return visibleFinished.sort(sortMatchesReverse);
}

function getMatchDetails(matchId) {
  const match = matches.find((item) => item.id === matchId);
  if (!match) return null;

  return {
    ...match,
    homeTeam: teams[match.homeTeamId],
    awayTeam: teams[match.awayTeamId],
    leagueProfile: ensureLeagueProfile(match.league),
    h2h: getHeadToHead(match.homeTeamId, match.awayTeamId)
  };
}

function getTeamLastFiveMatches(teamId) {
  const form = teams[teamId]?.form;
  return Array.isArray(form) ? form.slice(0, 5) : [];
}

function importFixtureData(payload, options = {}) {
  const normalized = normalizeFixturePayload(payload, options.source || "Imported JSON");
  matches.splice(0, matches.length, ...normalized.matches.map(cloneMatch));
  fixtureMeta = normalized.meta;

  if (options.persist !== false) {
    localStorage.setItem(FIXTURE_STORAGE_KEY, JSON.stringify(getFixtureDataExport()));
  }

  state.selectedMatchId = null;
  selectors.detailView.hidden = true;
  selectors.bracketView.hidden = true;
  selectors.homeView.hidden = false;
  renderFixtureSource();
  renderActiveView();
  setImportStatus(`Loaded ${matches.length} fixtures from ${fixtureMeta.source}.`);
  return getFixtureDataExport();
}

function resetFixtureData() {
  resetTeamsToSeed();
  matches.splice(0, matches.length, ...seedMatches.map(cloneMatch));
  fixtureMeta = { ...seedFixtureMeta };
  localStorage.removeItem(FIXTURE_STORAGE_KEY);
  if (selectors.fixtureJsonFile) selectors.fixtureJsonFile.value = "";
  if (selectors.fixtureUrlInput) selectors.fixtureUrlInput.value = "";
  state.selectedMatchId = null;
  selectors.detailView.hidden = true;
  selectors.bracketView.hidden = true;
  selectors.homeView.hidden = false;
  renderFixtureSource();
  renderActiveView();
  setImportStatus("Restored the built-in fixture snapshot.");
}

function getFixtureDataExport() {
  const teamIds = [...new Set(matches.flatMap((match) => [match.homeTeamId, match.awayTeamId]))];
  return {
    meta: {
      ...fixtureMeta,
      exportedAt: new Date().toISOString()
    },
    teams: teamIds.map((teamId) => exportTeam(teams[teamId])).filter(Boolean),
    matches: matches.map(exportMatch)
  };
}

async function loadFixtureDataFromUrl(url) {
  const cleanUrl = String(url || "").trim();
  if (!cleanUrl) throw new Error("Enter a JSON URL first.");
  const response = await fetch(cleanUrl, { cache: "no-store" });
  if (!response.ok) throw new Error(`Could not load fixtures: HTTP ${response.status}`);
  const payload = await response.json();
  return importFixtureData(payload, { source: cleanUrl });
}

async function loadLiveFixtureFeed(options = {}) {
  const response = await fetch(`${LIVE_FIXTURE_FEED_URL}?v=${Date.now()}`, { cache: "no-store" });
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Live feed is not published yet. Add the GitHub secret and run the fixture updater.");
    }
    throw new Error(`Could not load live feed: HTTP ${response.status}`);
  }
  const payload = await response.json();
  const imported = importFixtureData(payload, {
    source: LIVE_FIXTURE_FEED_URL,
    persist: options.persist
  });
  if (!options.silent) setImportStatus(`Loaded ${imported.matches.length} fixtures from the live feed.`);
  return imported;
}

function getWorldCupBracket() {
  return buildWorldCupBracket({ userPicks: state.bracketUserPicks });
}

function loadStoredFixtureData() {
  const raw = localStorage.getItem(FIXTURE_STORAGE_KEY);
  if (!raw) {
    renderFixtureSource();
    return false;
  }

  try {
    const normalized = normalizeFixturePayload(JSON.parse(raw), "Browser storage");
    matches.splice(0, matches.length, ...normalized.matches.map(cloneMatch));
    fixtureMeta = normalized.meta;
    renderFixtureSource();
    return true;
  } catch {
    localStorage.removeItem(FIXTURE_STORAGE_KEY);
    fixtureMeta = { ...seedFixtureMeta };
    renderFixtureSource();
    return false;
  }
}

function normalizeFixturePayload(payload, fallbackSource) {
  const rawMatches = Array.isArray(payload) ? payload : payload?.matches || payload?.fixtures;
  if (!Array.isArray(rawMatches)) {
    throw new Error("Fixture JSON must be an array or contain a matches array.");
  }

  const importedTeams = Array.isArray(payload?.teams) ? payload.teams : [];
  importedTeams.forEach((team) => normalizeImportedTeam(team));

  const normalizedMatches = rawMatches.map((match, index) => normalizeImportedMatch(match, index)).filter(Boolean);
  if (!normalizedMatches.length) throw new Error("No valid fixtures were found in that JSON.");

  return {
    meta: {
      source: payload?.meta?.source || payload?.source || fallbackSource,
      updatedAt: payload?.meta?.updatedAt || payload?.updatedAt || new Date().toISOString().slice(0, 10),
      note: payload?.meta?.note || "Imported fixture data"
    },
    matches: normalizedMatches.sort(sortMatches)
  };
}

function normalizeImportedTeam(team) {
  if (!team || typeof team !== "object") return null;
  const name = String(team.name || team.team || "").trim();
  if (!name) return null;

  const league = normalizeLeague(team.league || team.competition || "EPL");
  const id = normalizeTeamId(team.id || team.teamId || createTeamId(name, league));
  const existingId = findTeamIdByName(name) || id;
  const base =
    teams[existingId] ||
    makeImportedTeam(existingId, name, team.shortName || makeShortName(name), Number(team.rating) || 1600, team.venue || "", league);

  teams[existingId] = {
    ...base,
    id: existingId,
    name,
    shortName: String(team.shortName || team.abbreviation || base.shortName || makeShortName(name)).slice(0, 4).toUpperCase(),
    rating: Number(team.rating) || base.rating,
    venue: team.venue || base.venue || "",
    attacking: {
      ...base.attacking,
      ...(team.attacking || {})
    },
    defensive: {
      ...base.defensive,
      ...(team.defensive || {})
    },
    form: normalizeImportedForm(team.form)
  };

  return teams[existingId];
}

function normalizeImportedMatch(match, index) {
  if (!match || typeof match !== "object") return null;

  const league = normalizeLeague(match.league || match.competition);
  const date = normalizeDate(match.date || match.kickoffDate || match.utcDate);
  const time = normalizeTime(match.time || match.kickoffTime || match.utcTime || match.kickoff || match.utcDate);
  ensureLeagueProfile(league);
  const homeTeamId = resolveTeamForMatch(match.homeTeamId || match.homeId, match.homeTeam || match.home || match.homeName, league);
  const awayTeamId = resolveTeamForMatch(match.awayTeamId || match.awayId, match.awayTeam || match.away || match.awayName, league);

  if (!league || !date || !homeTeamId || !awayTeamId || homeTeamId === awayTeamId) return null;

  const score = normalizeScore(match.score);
  const status = normalizeStatus(match.status, date, score);
  const id = String(match.id || match.matchId || `${league}-${date}-${homeTeamId}-${awayTeamId}-${index}`).toLowerCase();

  return {
    id,
    league,
    date,
    time,
    kickoff: `${date}T${time}:00`,
    homeTeamId,
    awayTeamId,
    status,
    venue: match.venue || teams[homeTeamId]?.venue || "",
    stage: match.stage || match.round || match.matchday || "",
    minute: Number(match.minute) || null,
    score
  };
}

function resolveTeamForMatch(idLike, nameLike, league) {
  const directId = idLike ? normalizeTeamId(idLike) : "";
  if (directId && teams[directId]) return directId;

  const name = String(nameLike || "").trim();
  if (!name && directId) {
    if (!teams[directId]) teams[directId] = makeImportedTeam(directId, directId, directId, 1600, "", league);
    return directId;
  }
  const existingId = findTeamIdByName(name);
  if (existingId) return existingId;

  const id = directId || createTeamId(name, league);
  if (!teams[id]) {
    teams[id] = makeImportedTeam(id, name, makeShortName(name), 1600, "", league);
  }
  return id;
}

function normalizeLeague(value) {
  const raw = String(value || "").trim();
  if (leagueProfiles[raw]) return raw;
  const clean = raw.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const aliases = {
    "premier league": "EPL",
    epl: "EPL",
    pl: "EPL",
    "english premier league": "EPL",
    "la liga": "LALIGA",
    laliga: "LALIGA",
    pd: "LALIGA",
    "primera division": "LALIGA",
    "serie a": "SERIEA",
    "seria a": "SERIEA",
    sa: "SERIEA",
    bundesliga: "BUNDESLIGA",
    bl1: "BUNDESLIGA",
    "1 bundesliga": "BUNDESLIGA",
    "uefa champions league": "UCL",
    "champions league": "UCL",
    cl: "UCL",
    ucl: "UCL",
    "fifa world cup": "WC",
    "fifa world cup 2026": "WC",
    "world cup": "WC",
    wc: "WC"
  };
  return aliases[clean] || raw.toUpperCase();
}

function normalizeStatus(status, date, score) {
  const clean = String(status || "").toLowerCase().replace(/\s+/g, "");
  if (["live", "halftime", "finished", "upcoming"].includes(clean)) return clean;
  if (["ft", "fulltime", "full-time"].includes(clean)) return "finished";
  if (["ht", "half-time"].includes(clean)) return "halftime";
  if (score) return "finished";
  return date < todayKey ? "finished" : "upcoming";
}

function normalizeScore(score) {
  if (!score || typeof score !== "object") return null;
  const home = Number(score.home ?? score.homeGoals ?? score.homeTeam ?? score.fullTime?.home ?? score.fullTime?.homeTeam ?? score.fulltime?.home);
  const away = Number(score.away ?? score.awayGoals ?? score.awayTeam ?? score.fullTime?.away ?? score.fullTime?.awayTeam ?? score.fulltime?.away);
  if (!Number.isFinite(home) || !Number.isFinite(away)) return null;
  return { home, away };
}

function normalizeImportedForm(form) {
  if (!Array.isArray(form)) return [];
  const normalized = form
    .map((match, index) => {
      if (Array.isArray(match)) {
        return {
          date: formatDateKey(addDays(new Date(), -(index + 1) * 7)),
          competition: normalizeLeague(match[0] || "EPL"),
          opponent: String(match[1] || "Opponent"),
          venue: String(match[2] || "H"),
          goalsFor: Number(match[3]) || 0,
          goalsAgainst: Number(match[4]) || 0
        };
      }
      if (!match || typeof match !== "object") return null;
      return {
        date: normalizeDate(match.date) || formatDateKey(addDays(new Date(), -(index + 1) * 7)),
        competition: normalizeLeague(match.competition || match.league || "EPL"),
        opponent: String(match.opponent || "Opponent"),
        venue: String(match.venue || match.side || "H"),
        goalsFor: Number(match.goalsFor ?? match.gf) || 0,
        goalsAgainst: Number(match.goalsAgainst ?? match.ga) || 0
      };
    })
    .filter(Boolean)
    .slice(0, 5);
  return normalized;
}

function exportTeam(team) {
  if (!team) return null;
  return {
    id: team.id,
    name: team.name,
    shortName: team.shortName,
    rating: team.rating,
    venue: team.venue,
    attacking: team.attacking,
    defensive: team.defensive,
    form: team.form
  };
}

function exportMatch(match) {
  return {
    id: match.id,
    league: match.league,
    date: match.date,
    time: match.time,
    homeTeamId: match.homeTeamId,
    awayTeamId: match.awayTeamId,
    homeTeam: teams[match.homeTeamId]?.name || match.homeTeamId,
    awayTeam: teams[match.awayTeamId]?.name || match.awayTeamId,
    status: match.status,
    venue: match.venue,
    stage: match.stage,
    minute: match.minute,
    score: match.score
  };
}

function calculatePrediction(matchData) {
  const home = matchData.homeTeam;
  const away = matchData.awayTeam;
  const profile = matchData.leagueProfile;
  const homeForm = summarizeForm(home);
  const awayForm = summarizeForm(away);
  const h2h = summarizeH2H(matchData.h2h, home.id, away.id);

  const ratingEdge = (home.rating - away.rating) / 950;
  const hasComparableForm = homeForm.matchesPlayed > 0 && awayForm.matchesPlayed > 0;
  const formEdge = hasComparableForm ? (homeForm.pointsPerMatch - awayForm.pointsPerMatch) / 6 : 0;
  const goalTrendEdge = hasComparableForm ? ((homeForm.goalDifference / homeForm.matchesPlayed) - (awayForm.goalDifference / awayForm.matchesPlayed)) * 0.08 : 0;
  const h2hEdge = h2h.total ? ((h2h.homeWins - h2h.awayWins) / h2h.total) * 0.12 : 0;
  const homeEdge = profile.homeAdvantage + ratingEdge + formEdge + goalTrendEdge + h2hEdge;

  const baseHomeXg = profile.avgGoals * 0.53;
  const baseAwayXg = profile.avgGoals * 0.47;
  const homeAttack = homeForm.matchesPlayed ? blend(home.attacking.xg, homeForm.avgGoalsFor, 0.55) : home.attacking.xg;
  const awayAttack = awayForm.matchesPlayed ? blend(away.attacking.xg, awayForm.avgGoalsFor, 0.55) : away.attacking.xg;
  const homeDefense = homeForm.matchesPlayed ? blend(home.defensive.xga, homeForm.avgGoalsAgainst, 0.5) : home.defensive.xga;
  const awayDefense = awayForm.matchesPlayed ? blend(away.defensive.xga, awayForm.avgGoalsAgainst, 0.5) : away.defensive.xga;

  const pregameHomeXg = clamp(baseHomeXg + (homeAttack - awayDefense) * 0.42 + homeEdge * 0.48, 0.25, 4.4);
  const pregameAwayXg = clamp(baseAwayXg + (awayAttack - homeDefense) * 0.42 - homeEdge * 0.34, 0.25, 4.4);
  const currentScore = matchData.score || { home: 0, away: 0 };
  const minute = matchData.minute || 0;
  const remainingFactor = matchData.status === "live" || matchData.status === "halftime" ? clamp((94 - minute) / 94, 0.04, 1) : 1;
  const remainingHomeXg = matchData.status === "finished" ? 0 : pregameHomeXg * remainingFactor;
  const remainingAwayXg = matchData.status === "finished" ? 0 : pregameAwayXg * remainingFactor;

  const matrix = buildScoreMatrix(remainingHomeXg, remainingAwayXg, currentScore, 7);
  const outcome = summarizeScoreMatrix(matrix);
  const likelyScore = matrix.flat().sort((a, b) => b.probability - a.probability)[0];
  const maxOutcome = Math.max(outcome.home, outcome.draw, outcome.away);
  const secondOutcome = [outcome.home, outcome.draw, outcome.away].sort((a, b) => b - a)[1];
  const confidenceScore = clamp((maxOutcome - secondOutcome) * 1.6 + Math.abs(homeEdge) * 0.3 + 0.08, 0, 1);
  const confidence = confidenceScore > 0.42 ? "High" : confidenceScore > 0.22 ? "Medium" : "Low";
  const winner =
    outcome.home >= outcome.draw && outcome.home >= outcome.away
      ? `${home.name} win`
      : outcome.away >= outcome.home && outcome.away >= outcome.draw
        ? `${away.name} win`
        : "Draw";

  return {
    probabilities: outcome,
    confidence,
    confidenceScore,
    predictedScore: `${likelyScore.homeGoals}-${likelyScore.awayGoals}`,
    expectedGoals: {
      home: currentScore.home + remainingHomeXg,
      away: currentScore.away + remainingAwayXg
    },
    mostLikelyResult: winner,
    form: {
      home: homeForm,
      away: awayForm
    },
    h2h
  };
}

function getHeadToHead(homeTeamId, awayTeamId) {
  return headToHead[pairKey(homeTeamId, awayTeamId)] || generateHeadToHead(homeTeamId, awayTeamId);
}

function generateHeadToHead(homeTeamId, awayTeamId) {
  const home = teams[homeTeamId];
  const away = teams[awayTeamId];
  if (!home || !away) return [];

  const seed = [...pairKey(homeTeamId, awayTeamId)].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return [0, 1, 2, 3].map((index) => {
    const homeBias = clamp((home.rating - away.rating) / 350 + (index % 2 === 0 ? 0.18 : -0.08), -0.55, 0.55);
    const baseHome = 1 + ((seed + index) % 3);
    const baseAway = 1 + ((seed + index * 2) % 3);
    const homeGoals = clamp(Math.round(baseHome + homeBias), 0, 4);
    const awayGoals = clamp(Math.round(baseAway - homeBias), 0, 4);

    return {
      date: dateKeyFromOffset(-120 - index * 170),
      competition: inferCompetitionForTeams(homeTeamId, awayTeamId),
      homeTeamId: index % 2 === 0 ? homeTeamId : awayTeamId,
      awayTeamId: index % 2 === 0 ? awayTeamId : homeTeamId,
      homeGoals: index % 2 === 0 ? homeGoals : awayGoals,
      awayGoals: index % 2 === 0 ? awayGoals : homeGoals,
      venue: index % 2 === 0 ? home.venue : away.venue
    };
  });
}

function inferCompetitionForTeams(homeTeamId, awayTeamId) {
  const directMatch = matches.find(
    (match) =>
      (match.homeTeamId === homeTeamId && match.awayTeamId === awayTeamId) ||
      (match.homeTeamId === awayTeamId && match.awayTeamId === homeTeamId)
  );
  return directMatch?.league || "EPL";
}

function summarizeForm(team) {
  const form = getTeamLastFiveMatches(team.id);
  const summary = form.reduce(
    (totals, match) => {
      const result = resultFor(match.goalsFor, match.goalsAgainst);
      totals.wins += result === "W" ? 1 : 0;
      totals.draws += result === "D" ? 1 : 0;
      totals.losses += result === "L" ? 1 : 0;
      totals.goalsFor += match.goalsFor;
      totals.goalsAgainst += match.goalsAgainst;
      totals.cleanSheets += match.goalsAgainst === 0 ? 1 : 0;
      totals.failedToScore += match.goalsFor === 0 ? 1 : 0;
      totals.points += result === "W" ? 3 : result === "D" ? 1 : 0;
      totals.results.push(result);
      return totals;
    },
    {
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      cleanSheets: 0,
      failedToScore: 0,
      points: 0,
      results: []
    }
  );

  const matchesPlayed = form.length;
  return {
    ...summary,
    matches: form,
    matchesPlayed,
    avgGoalsFor: matchesPlayed ? summary.goalsFor / matchesPlayed : 0,
    avgGoalsAgainst: matchesPlayed ? summary.goalsAgainst / matchesPlayed : 0,
    goalDifference: summary.goalsFor - summary.goalsAgainst,
    pointsPerMatch: matchesPlayed ? summary.points / matchesPlayed : 0
  };
}

function summarizeH2H(meetings, homeTeamId, awayTeamId) {
  const summary = meetings.reduce(
    (totals, match) => {
      const homeTeamGoals = match.homeTeamId === homeTeamId ? match.homeGoals : match.awayGoals;
      const awayTeamGoals = match.homeTeamId === awayTeamId ? match.homeGoals : match.awayGoals;
      totals.total += 1;
      totals.goals += match.homeGoals + match.awayGoals;
      totals.homeWins += homeTeamGoals > awayTeamGoals ? 1 : 0;
      totals.awayWins += awayTeamGoals > homeTeamGoals ? 1 : 0;
      totals.draws += homeTeamGoals === awayTeamGoals ? 1 : 0;
      return totals;
    },
    { total: 0, homeWins: 0, awayWins: 0, draws: 0, goals: 0 }
  );

  return {
    ...summary,
    avgGoals: summary.total ? summary.goals / summary.total : 0
  };
}

function buildScoreMatrix(homeXg, awayXg, currentScore, maxAdditionalGoals) {
  const matrix = [];
  for (let homeAdd = 0; homeAdd <= maxAdditionalGoals; homeAdd += 1) {
    const row = [];
    for (let awayAdd = 0; awayAdd <= maxAdditionalGoals; awayAdd += 1) {
      row.push({
        homeGoals: currentScore.home + homeAdd,
        awayGoals: currentScore.away + awayAdd,
        probability: poisson(homeXg, homeAdd) * poisson(awayXg, awayAdd)
      });
    }
    matrix.push(row);
  }
  return matrix;
}

function summarizeScoreMatrix(matrix) {
  const result = {
    home: 0,
    draw: 0,
    away: 0,
    over15: 0,
    over25: 0,
    btts: 0,
    homeCleanSheet: 0,
    awayCleanSheet: 0,
    firstHalfGoal: 0
  };

  for (const row of matrix) {
    for (const score of row) {
      if (score.homeGoals > score.awayGoals) result.home += score.probability;
      if (score.homeGoals === score.awayGoals) result.draw += score.probability;
      if (score.homeGoals < score.awayGoals) result.away += score.probability;
      if (score.homeGoals + score.awayGoals > 1.5) result.over15 += score.probability;
      if (score.homeGoals + score.awayGoals > 2.5) result.over25 += score.probability;
      if (score.homeGoals > 0 && score.awayGoals > 0) result.btts += score.probability;
      if (score.awayGoals === 0) result.homeCleanSheet += score.probability;
      if (score.homeGoals === 0) result.awayCleanSheet += score.probability;
    }
  }

  const outcomeTotal = result.home + result.draw + result.away;
  Object.keys(result).forEach((key) => {
    result[key] = outcomeTotal ? result[key] / outcomeTotal : 0;
  });
  result.firstHalfGoal = clamp((result.over15 * 0.68 + result.btts * 0.28), 0.18, 0.86);
  return result;
}

function poisson(lambda, goals) {
  return (Math.pow(lambda, goals) * Math.exp(-lambda)) / factorial(goals);
}

function factorial(number) {
  let total = 1;
  for (let index = 2; index <= number; index += 1) total *= index;
  return total;
}

function resultFor(goalsFor, goalsAgainst) {
  if (goalsFor > goalsAgainst) return "W";
  if (goalsFor === goalsAgainst) return "D";
  return "L";
}

function renderBoardWithLoading() {
  selectors.homeView.hidden = false;
  selectors.bracketView.hidden = true;
  selectors.detailView.hidden = true;
  selectors.loadingState.hidden = false;
  selectors.matchGroups.hidden = true;
  selectors.emptyState.hidden = true;
  clearTimeout(state.renderTimer);
  state.renderTimer = setTimeout(() => {
    renderBoard();
    selectors.loadingState.hidden = true;
    selectors.matchGroups.hidden = false;
  }, 140);
}

function renderActiveView() {
  if (state.activeView === "worldcup") {
    renderWorldCupView();
    return;
  }
  renderBoardWithLoading();
}

function renderBoard() {
  const allMatches = getMatchesForActiveView();
  const visibleMatches = filterMatches(allMatches);
  selectors.headerMatchCount.textContent = `${visibleMatches.length} ${visibleMatches.length === 1 ? "match" : "matches"}`;
  selectors.emptyState.hidden = visibleMatches.length > 0;

  if (!visibleMatches.length) {
    selectors.matchGroups.innerHTML = "";
    return;
  }

  selectors.matchGroups.innerHTML = groupByLeague(visibleMatches)
    .map(renderLeagueGroup)
    .join("");
}

function getMatchesForActiveView() {
  if (state.activeView === "live") return getLiveMatches();
  if (state.activeView === "upcoming") return getUpcomingMatches();
  if (state.activeView === "finished") return getFinishedMatches();
  return getMatchesByDate(state.selectedDate);
}

function filterMatches(list) {
  const needle = state.search.trim().toLowerCase();
  if (!needle) return list;
  return list.filter((match) => {
    const home = teams?.[match.homeTeamId];
    const away = teams?.[match.awayTeamId];
    const league = leagueProfiles?.[match.league];
    return `
      ${home?.name ?? match.homeTeamId}
      ${away?.name ?? match.awayTeamId}
      ${league?.name ?? match.league}
      ${league?.shortName ?? league?.name ?? match.league}
    `
      .toLowerCase()
      .includes(needle);
  });
}

function groupByLeague(list) {
  const groups = new Map();
  list.forEach((match) => {
    if (!groups.has(match.league)) groups.set(match.league, []);
    groups.get(match.league).push(match);
  });

  return [...groups.entries()]
    .sort((a, b) => ensureLeagueProfile(a[0]).order - ensureLeagueProfile(b[0]).order)
    .map(([league, leagueMatches]) => ({
      league,
      matches: leagueMatches.sort(sortMatches)
    }));
}

function renderLeagueGroup(group) {
  const profile = ensureLeagueProfile(group.league);
  return `
    <section class="league-group">
      <header class="league-header">
        <span>${escapeHtml(profile.name)}</span>
        <strong>${group.matches.length}</strong>
      </header>
      <div class="league-matches">
        ${group.matches.map(safeRenderMatchCard).join("")}
      </div>
    </section>
  `;
}

function safeRenderMatchCard(match) {
  try {
    return renderMatchCard(match);
  } catch (e) {
    console.warn("GoalIQ: skipping invalid fixture", match?.id ?? match, e);
    return "";
  }
}

function renderMatchCard(match) {
  const details = getMatchDetails(match.id);
  const prediction = calculatePrediction(details);
  const status = statusLabels[match.status];
  const scoreLabel = match.score ? `${match.score.home}-${match.score.away}` : "vs";
  const contextLabel = formatMatchContext(match, details);

  return `
    <button class="match-card" type="button" data-match-id="${match.id}">
      <div class="match-meta">
        <span>${formatMatchTime(match)}</span>
        <span class="status-chip ${match.status}">${status}</span>
      </div>
      <div class="team-lines">
        <div class="team-row">
          <span class="team-badge">${escapeHtml(details.homeTeam.shortName)}</span>
          <strong>${escapeHtml(details.homeTeam.name)}</strong>
          <span class="team-score">${match.score ? match.score.home : ""}</span>
        </div>
        <div class="team-row">
          <span class="team-badge away">${escapeHtml(details.awayTeam.shortName)}</span>
          <strong>${escapeHtml(details.awayTeam.name)}</strong>
          <span class="team-score">${match.score ? match.score.away : ""}</span>
        </div>
      </div>
      <div class="board-picks" aria-label="Prediction percentages">
        ${renderPick("Home", prediction.probabilities.home)}
        ${renderPick("Draw", prediction.probabilities.draw)}
        ${renderPick("Away", prediction.probabilities.away)}
      </div>
      <div class="card-footer">
        <span>${escapeHtml(contextLabel)}</span>
        <strong>${scoreLabel}</strong>
      </div>
    </button>
  `;
}


function formatMatchContext(match, details) {
  const stage = String(details.stage || "").trim();
  const date = match.date ? dateLabel(match.date) : "Date TBC";
  return stage ? `${stage} - ${date}` : date;
}
function renderPick(label, probability) {
  return `
    <span class="pick-card">
      <small>${label}</small>
      <strong>${formatPercent(probability)}</strong>
    </span>
  `;
}

function openMatchDetail(matchId) {
  state.selectedMatchId = matchId;
  state.detailTab = "overview";
  selectors.homeView.hidden = true;
  selectors.bracketView.hidden = true;
  selectors.detailView.hidden = false;
  renderDetail();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function closeMatchDetail() {
  state.selectedMatchId = null;
  selectors.detailView.hidden = true;
  if (state.activeView === "worldcup") {
    renderWorldCupView();
  } else {
    selectors.homeView.hidden = false;
    renderBoardWithLoading();
  }
}

function renderDetail() {
  const details = getMatchDetails(state.selectedMatchId);
  if (!details) return;

  const prediction = calculatePrediction(details);
  const scoreDisplay = getDetailScoreDisplay(details, prediction);
  const isFinished = details.status === "finished";
  selectors.detailStatus.textContent = statusLabels[details.status];
  selectors.detailStatus.className = `status-chip ${details.status}`;
  selectors.detailLeague.textContent = details.leagueProfile.name;
  selectors.detailTitle.textContent = `${details.homeTeam.name} vs ${details.awayTeam.name}`;
  selectors.detailMeta.textContent = `${formatLongDate(details.date)} - ${details.time} - ${details.stage ? `${details.stage} - ` : ""}${details.venue}`;
  selectors.scorePredictionLabel.textContent = scoreDisplay.label;
  selectors.predictedScore.textContent = scoreDisplay.value;
  selectors.probabilityPanelTitle.textContent = isFinished ? "Pre-match probability" : "Winning probability";
  selectors.confidenceLevel.textContent = isFinished ? "Finished result" : `${prediction.confidence} confidence`;
  selectors.extraPredictionsTitle.textContent = isFinished ? "Archived predictions" : "Extra predictions";
  selectors.mostLikelyResult.textContent = prediction.mostLikelyResult;

  selectors.probabilityCards.innerHTML = [
    [details.homeTeam.name, prediction.probabilities.home],
    ["Draw", prediction.probabilities.draw],
    [details.awayTeam.name, prediction.probabilities.away]
  ]
    .map(([label, value]) => renderProbabilityCard(label, value))
    .join("");

  selectors.overviewRows.innerHTML = renderStatRows([
    ["Competition", details.leagueProfile.name],
    ...(details.stage ? [["Stage", details.stage]] : []),
    ["Date", formatLongDate(details.date)],
    ["Kickoff", details.time],
    ["Venue", details.venue],
    ["Status", statusLabels[details.status]],
    ...(details.score ? [[scoreDisplay.label, `${details.homeTeam.shortName} ${details.score.home} - ${details.score.away} ${details.awayTeam.shortName}`]] : []),
    ["Expected goals", `${formatNumber(prediction.expectedGoals.home)} - ${formatNumber(prediction.expectedGoals.away)}`]
  ]);

  selectors.extraPredictions.innerHTML = [
    ["Over 1.5 goals", prediction.probabilities.over15],
    ["Over 2.5 goals", prediction.probabilities.over25],
    ["Both teams to score", prediction.probabilities.btts],
    [`${details.homeTeam.shortName} clean sheet`, prediction.probabilities.homeCleanSheet],
    [`${details.awayTeam.shortName} clean sheet`, prediction.probabilities.awayCleanSheet],
    ["First half goal", prediction.probabilities.firstHalfGoal]
  ]
    .map(([label, value]) => renderMarketTile(label, value))
    .join("");

  selectors.formGrid.innerHTML = [
    renderFormPanel(details.homeTeam, prediction.form.home),
    renderFormPanel(details.awayTeam, prediction.form.away)
  ].join("");

  selectors.attackingStats.innerHTML = renderComparisonRows(details.homeTeam, details.awayTeam, [
    ["Average goals", "attacking", "avgGoals"],
    ["Average shots", "attacking", "shots"],
    ["Shots on target", "attacking", "shotsOnTarget"],
    ["Big chances", "attacking", "bigChances"],
    ["Expected goals", "attacking", "xg"]
  ]);

  selectors.defensiveStats.innerHTML = renderComparisonRows(details.homeTeam, details.awayTeam, [
    ["Goals conceded avg", "defensive", "goalsConcededAvg"],
    ["Clean sheet percentage", "defensive", "cleanSheetPct", "%"],
    ["Expected goals against", "defensive", "xga"],
    ["Cards", "defensive", "cards"]
  ]);

  selectors.h2hSummary.textContent = `${prediction.h2h.homeWins}-${prediction.h2h.draws}-${prediction.h2h.awayWins}`;
  selectors.h2hRows.innerHTML = renderH2H(details, prediction.h2h);
  renderDetailTabState();
}

function getDetailScoreDisplay(match, prediction) {
  if (match.score) {
    return {
      label: match.status === "finished" ? "Final score" : "Current score",
      value: `${match.score.home}-${match.score.away}`
    };
  }

  return {
    label: "Predicted score",
    value: prediction.predictedScore
  };
}

function renderProbabilityCard(label, probability) {
  return `
    <article class="prob-card">
      <span>${escapeHtml(label)}</span>
      <strong>${formatPercent(probability)}</strong>
      <div class="prob-bar"><span style="width:${probability * 100}%"></span></div>
    </article>
  `;
}

function renderMarketTile(label, probability) {
  return `
    <article class="market-tile">
      <span>${escapeHtml(label)}</span>
      <strong>${formatPercent(probability)}</strong>
    </article>
  `;
}

function renderFormPanel(team, formSummary) {
  const hasForm = formSummary.matches.length > 0;
  const rows = [
    ["Wins", formSummary.wins],
    ["Draws", formSummary.draws],
    ["Losses", formSummary.losses],
    ["Goals scored", formSummary.goalsFor],
    ["Goals conceded", formSummary.goalsAgainst],
    ["Clean sheets", formSummary.cleanSheets],
    ["Failed to score", formSummary.failedToScore]
  ];

  return `
    <section class="panel-card">
      <div class="panel-title">
        <span>${escapeHtml(team.name)}</span>
        <strong>${hasForm ? `${formatNumber(formSummary.pointsPerMatch)} PPM` : "No form"}</strong>
      </div>
      ${
        hasForm
          ? `
            <div class="form-strip">
              ${formSummary.results.map((result) => `<span class="form-chip ${result.toLowerCase()}">${result}</span>`).join("")}
            </div>
            <div class="form-matches">
              ${formSummary.matches
                .map(
                  (match) => `
                    <div>
                      <span>${escapeHtml(match.venue)} vs ${escapeHtml(match.opponent)}</span>
                      <strong>${match.goalsFor}-${match.goalsAgainst}</strong>
                    </div>
                  `
                )
                .join("")}
            </div>
            <div class="stat-rows">${renderStatRows(rows)}</div>
          `
          : `<div class="empty-state inline"><strong>No recent form data available</strong><span>GoalIQ will show live form when the feed provides finished matches for this team.</span></div>`
      }
    </section>
  `;
}

function renderComparisonRows(homeTeam, awayTeam, rows) {
  return `
    <div class="comparison-head">
      <span></span>
      <strong>${escapeHtml(homeTeam.shortName)}</strong>
      <strong>${escapeHtml(awayTeam.shortName)}</strong>
    </div>
    ${rows
      .map(([label, group, key, suffix = ""]) => {
        const homeValue = homeTeam[group][key];
        const awayValue = awayTeam[group][key];
        return `
          <div class="comparison-row">
            <span>${escapeHtml(label)}</span>
            <strong>${formatStat(homeValue, suffix)}</strong>
            <strong>${formatStat(awayValue, suffix)}</strong>
          </div>
        `;
      })
      .join("")}
  `;
}

function renderH2H(details, summary) {
  if (!details.h2h.length) {
    return `<div class="empty-state inline"><strong>No head-to-head data</strong><span>Mock data can be replaced by an API later.</span></div>`;
  }

  return `
    <div class="h2h-summary-grid">
      <div><span>${escapeHtml(details.homeTeam.shortName)} wins</span><strong>${summary.homeWins}</strong></div>
      <div><span>Draws</span><strong>${summary.draws}</strong></div>
      <div><span>${escapeHtml(details.awayTeam.shortName)} wins</span><strong>${summary.awayWins}</strong></div>
      <div><span>Average goals</span><strong>${formatNumber(summary.avgGoals)}</strong></div>
    </div>
    ${details.h2h
      .map((match) => {
        const home = teams[match.homeTeamId];
        const away = teams[match.awayTeamId];
        return `
          <div class="h2h-row">
            <span>${formatLongDate(match.date)}</span>
            <strong>${escapeHtml(home.name)} ${match.homeGoals}-${match.awayGoals} ${escapeHtml(away.name)}</strong>
            <small>${escapeHtml(leagueProfiles[match.competition]?.shortName || match.competition)}</small>
          </div>
        `;
      })
      .join("")}
  `;
}

function renderWorldCupView() {
  clearTimeout(state.renderTimer);
  const bracket = buildWorldCupBracket({ userPicks: state.bracketUserPicks });
  const modelBracket = buildWorldCupBracket({ userPicks: {} });
  const selectedMatch = bracket.matchesById.get(state.selectedBracketMatchId) || bracket.rounds[0]?.matches[0] || null;
  if (selectedMatch && !state.selectedBracketMatchId) state.selectedBracketMatchId = selectedMatch.id;

  selectors.homeView.hidden = true;
  selectors.detailView.hidden = true;
  selectors.bracketView.hidden = false;
  selectors.headerMatchCount.textContent = "World Cup 2026";
  selectors.bracketContent.innerHTML = `
    ${renderWorldCupHero(modelBracket, bracket)}
    <div class="worldcup-layout">
      <section class="worldcup-section">
        <div class="panel-title">
          <span>Group stage</span>
          <strong>12 groups of 4</strong>
        </div>
        <div class="worldcup-groups">
          ${bracket.standings.map(renderWorldCupGroup).join("")}
        </div>
      </section>
      <section class="worldcup-section bracket-section">
        <div class="panel-title">
          <span>Prediction bracket</span>
          <strong>Round of 32 to final</strong>
        </div>
        <div class="bracket-scroll" aria-label="FIFA World Cup 2026 prediction bracket">
          <div class="bracket-grid">
            ${bracket.rounds.map(renderWorldCupRound).join("")}
          </div>
        </div>
      </section>
      ${renderWorldCupMatchDrawer(selectedMatch, modelBracket.matchesById.get(selectedMatch?.id))}
    </div>
  `;
}

function renderWorldCupHero(modelBracket, userBracket) {
  const modelChampion = modelBracket.champion;
  const userChampion = userBracket.champion;
  const pickCount = Object.keys(state.bracketUserPicks).length;
  return `
    <section class="worldcup-hero">
      <div>
        <span class="section-kicker">FIFA World Cup 2026</span>
        <h2>GoalIQ prediction bracket</h2>
        <p>Group tables use live World Cup fixture scores when they exist, then the bracket advances from actual results, your picks, or the model favorite.</p>
      </div>
      <div class="champion-card">
        <span>Model champion</span>
        <strong>${escapeHtml(modelChampion?.name || "TBD")}</strong>
        <small>${pickCount ? `${pickCount} saved pick${pickCount === 1 ? "" : "s"}` : "No user picks yet"}${userChampion ? ` - Your path: ${escapeHtml(userChampion.name)}` : ""}</small>
      </div>
    </section>
  `;
}

function renderWorldCupGroup(groupStanding) {
  return `
    <article class="worldcup-group-card">
      <header>
        <span>Group ${escapeHtml(groupStanding.group)}</span>
        <strong>${groupStanding.table.filter((row) => row.played > 0).length ? "Live table" : "Model seed"}</strong>
      </header>
      <div class="worldcup-table">
        ${groupStanding.table
          .map(
            (row, index) => `
              <div class="worldcup-table-row ${index < 2 ? "qualifier" : index === 2 ? "third-place" : ""}">
                <span>${index + 1}</span>
                <strong>${escapeHtml(row.team.name)}</strong>
                <small>${row.points} pts</small>
                <small>${row.goalDifference >= 0 ? "+" : ""}${row.goalDifference}</small>
              </div>
            `
          )
          .join("")}
      </div>
    </article>
  `;
}

function renderWorldCupRound(round) {
  return `
    <div class="bracket-round">
      <h3>${escapeHtml(round.label)}</h3>
      <div class="bracket-round-matches">
        ${round.matches.map(renderWorldCupMatchCard).join("")}
      </div>
    </div>
  `;
}

function renderWorldCupMatchCard(match) {
  const difference = match.userPick && match.modelWinner && match.userPick !== match.modelWinner.code;
  const hasResult = Boolean(match.result);
  return `
    <button class="bracket-match ${state.selectedBracketMatchId === match.id ? "active" : ""} ${difference ? "pick-diff" : ""} ${hasResult ? "settled" : ""}" type="button" data-bracket-match-id="${escapeHtml(match.id)}">
      <span class="bracket-match-meta">${escapeHtml(match.id)} - ${escapeHtml(formatShortDate(match.date))}</span>
      ${renderWorldCupTeamSlot(match.home, match)}
      ${renderWorldCupTeamSlot(match.away, match)}
    </button>
  `;
}

function renderWorldCupTeamSlot(teamEntry, match) {
  const isWinner = teamEntry && match.winner?.code === teamEntry.code;
  const isUserPick = teamEntry && match.userPick === teamEntry.code;
  const opponent = getOpponentForSlot(teamEntry, match);
  const probability = teamEntry && opponent ? formatPercent(getWorldCupWinProbability(teamEntry, opponent)) : "TBD";
  return `
    <div class="bracket-team ${isWinner ? "winner" : ""} ${isUserPick ? "user-pick" : ""}">
      <span>${escapeHtml(teamEntry?.shortName || "TBD")}</span>
      <strong>${escapeHtml(teamEntry?.name || "To be decided")}</strong>
      <small>${probability}</small>
    </div>
  `;
}

function renderWorldCupMatchDrawer(match, modelMatch) {
  if (!match) {
    return `<section class="worldcup-drawer empty-state inline"><strong>No bracket match selected</strong><span>Select a match to inspect the prediction.</span></section>`;
  }

  const modelPick = modelMatch?.modelWinner || match.modelWinner;
  const prediction = getWorldCupMatchPrediction(match.home, match.away);
  const canPick = match.home && match.away && !match.result;
  return `
    <section class="worldcup-drawer">
      <div class="panel-title">
        <span>${escapeHtml(match.label)}</span>
        <strong>${escapeHtml(match.id)}</strong>
      </div>
      <div class="drawer-headline">
        <strong>${escapeHtml(match.home?.name || "TBD")} vs ${escapeHtml(match.away?.name || "TBD")}</strong>
        <span>${escapeHtml(formatLongDate(match.date))} - ${escapeHtml(match.venue)}</span>
      </div>
      <div class="drawer-grid">
        <div><span>Model pick</span><strong>${escapeHtml(modelPick?.name || "TBD")}</strong></div>
        <div><span>Expected goals</span><strong>${prediction.expectedGoals}</strong></div>
        <div><span>Result source</span><strong>${match.result ? "Fixture feed" : match.userPick ? "Your pick" : "GoalIQ model"}</strong></div>
        <div><span>Score</span><strong>${match.result ? `${match.result.home}-${match.result.away}` : "Pending"}</strong></div>
      </div>
      <div class="pick-actions">
        ${[match.home, match.away]
          .filter(Boolean)
          .map(
            (teamEntry) => `
              <button class="user-pick-button ${match.userPick === teamEntry.code ? "active" : ""}" type="button" data-bracket-pick="${escapeHtml(match.id)}" data-team-code="${escapeHtml(teamEntry.code)}" ${canPick ? "" : "disabled"}>
                ${escapeHtml(teamEntry.shortName)}
              </button>
            `
          )
          .join("")}
        <button class="user-pick-button muted" type="button" data-bracket-clear="${escapeHtml(match.id)}" ${match.userPick ? "" : "disabled"}>Clear</button>
      </div>
      <p class="source-note">Predictions are for analysis only. No result is guaranteed.</p>
    </section>
  `;
}

function buildWorldCupBracket({ userPicks = {} } = {}) {
  const standings = getWorldCupStandings();
  const slots = getWorldCupSeedSlots(standings);
  const usedThirdGroups = new Set();
  const byId = new Map();
  const rounds = [
    {
      key: "round32",
      label: "Round of 32",
      matches: worldCupRoundOf32.map((template) => {
        const home = resolveWorldCupSeed(template.home, slots, usedThirdGroups);
        const away = resolveWorldCupSeed(template.away, slots, usedThirdGroups);
        const match = createWorldCupKnockoutMatch(template, home, away, userPicks);
        byId.set(match.id, match);
        return match;
      })
    }
  ];

  worldCupLaterRounds.forEach((round) => {
    const roundMatches = round.matches.map(([id, date, venue, homeSource, awaySource]) => {
      const template = wcMatch(id, round.label, date, venue, wcPrevious(homeSource), wcPrevious(awaySource));
      const home = byId.get(homeSource)?.winner || null;
      const away = byId.get(awaySource)?.winner || null;
      const match = createWorldCupKnockoutMatch(template, home, away, userPicks);
      byId.set(match.id, match);
      return match;
    });
    rounds.push({ key: round.key, label: round.label, matches: roundMatches });
  });

  return {
    standings,
    rounds,
    matchesById: byId,
    champion: byId.get("M104")?.winner || null
  };
}

function getWorldCupStandings() {
  return worldCupGroups.map((groupData) => ({
    group: groupData.name,
    table: rankWorldCupGroup(groupData, getWorldCupGroupFixtures(groupData))
  }));
}

function rankWorldCupGroup(groupData, fixtures) {
  const rows = groupData.teams.map((teamEntry) => ({
    team: teamEntry,
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0
  }));
  const table = new Map(rows.map((row) => [normalizeWorldCupName(row.team.name), row]));

  fixtures.forEach((fixture) => {
    const home = table.get(normalizeWorldCupName(getFixtureTeamName(fixture, "home")));
    const away = table.get(normalizeWorldCupName(getFixtureTeamName(fixture, "away")));
    if (!home || !away || !fixture.score) return;
    applyWorldCupGroupScore(home, fixture.score.home, fixture.score.away);
    applyWorldCupGroupScore(away, fixture.score.away, fixture.score.home);
  });

  return rows.sort((a, b) => {
    return (
      b.points - a.points ||
      b.goalDifference - a.goalDifference ||
      b.goalsFor - a.goalsFor ||
      b.team.rating - a.team.rating ||
      a.team.name.localeCompare(b.team.name)
    );
  });
}

function getWorldCupSeedSlots(standings) {
  const slots = {};
  const thirdRows = [];
  standings.forEach((groupStanding) => {
    slots[`${groupStanding.group}1`] = groupStanding.table[0]?.team || null;
    slots[`${groupStanding.group}2`] = groupStanding.table[1]?.team || null;
    if (groupStanding.table[2]) thirdRows.push({ ...groupStanding.table[2], group: groupStanding.group });
  });

  thirdRows
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
      slots[`${row.group}3`] = row.team;
    });

  return slots;
}

function resolveWorldCupSeed(seed, slots, usedThirdGroups) {
  if (seed.type === "group") return slots[`${seed.group}${seed.rank}`] || null;
  if (seed.type === "third") {
    const groupName = seed.groups.find((candidate) => slots[`${candidate}3`] && !usedThirdGroups.has(candidate));
    if (!groupName) return null;
    usedThirdGroups.add(groupName);
    return slots[`${groupName}3`];
  }
  return null;
}

function createWorldCupKnockoutMatch(template, home, away, userPicks) {
  const fixture = findWorldCupFixtureBetween(home, away, template.date);
  const result = fixture?.score ? orientWorldCupScore(fixture, home, away) : null;
  const userPick = userPicks[template.id] || null;
  const modelWinner = getWorldCupModelWinner(home, away);
  return {
    id: template.id,
    label: template.label,
    date: fixture?.date || template.date,
    venue: fixture?.venue || template.venue,
    home,
    away,
    result,
    userPick,
    modelWinner,
    winner: getWorldCupWinner(home, away, result, userPick),
    source: fixture || template
  };
}

function getWorldCupWinner(home, away, result, userPick) {
  if (!home || !away) return null;
  if (result) {
    if (result.home > result.away) return home;
    if (result.away > result.home) return away;
  }
  if (userPick === home.code) return home;
  if (userPick === away.code) return away;
  return getWorldCupModelWinner(home, away);
}

function getWorldCupModelWinner(home, away) {
  if (!home || !away) return null;
  return home.rating >= away.rating ? home : away;
}

function getWorldCupMatchPrediction(home, away) {
  if (!home || !away) return { expectedGoals: "TBD" };
  const edge = clamp((home.rating - away.rating) / 500, -0.8, 0.8);
  const homeGoals = clamp(1.35 + edge * 0.75, 0.55, 2.75);
  const awayGoals = clamp(1.2 - edge * 0.62, 0.45, 2.6);
  return {
    expectedGoals: `${formatNumber(homeGoals)} - ${formatNumber(awayGoals)}`
  };
}

function getWorldCupWinProbability(teamEntry, opponent) {
  if (!teamEntry || !opponent) return 0;
  return clamp(1 / (1 + Math.pow(10, (opponent.rating - teamEntry.rating) / 420)), 0.12, 0.88);
}

function getOpponentForSlot(teamEntry, match) {
  if (!teamEntry) return null;
  return match.home?.code === teamEntry.code ? match.away : match.home;
}

function getWorldCupGroupFixtures(groupData) {
  const groupNames = new Set(groupData.teams.map((teamEntry) => normalizeWorldCupName(teamEntry.name)));
  return getWorldCupFixtures().filter((fixture) => {
    const home = normalizeWorldCupName(getFixtureTeamName(fixture, "home"));
    const away = normalizeWorldCupName(getFixtureTeamName(fixture, "away"));
    return groupNames.has(home) && groupNames.has(away);
  });
}

function getWorldCupFixtures() {
  return matches.filter((match) => normalizeLeague(match.league) === "WC");
}

function findWorldCupFixtureBetween(home, away, fallbackDate) {
  if (!home || !away) return null;
  const homeName = normalizeWorldCupName(home.name);
  const awayName = normalizeWorldCupName(away.name);
  return (
    getWorldCupFixtures().find((fixture) => {
      const fixtureHome = normalizeWorldCupName(getFixtureTeamName(fixture, "home"));
      const fixtureAway = normalizeWorldCupName(getFixtureTeamName(fixture, "away"));
      const samePair =
        (fixtureHome === homeName && fixtureAway === awayName) ||
        (fixtureHome === awayName && fixtureAway === homeName);
      return samePair && fixture.date >= "2026-06-28";
    }) || {
      date: fallbackDate,
      venue: ""
    }
  );
}

function orientWorldCupScore(fixture, home, away) {
  const fixtureHome = normalizeWorldCupName(getFixtureTeamName(fixture, "home"));
  const bracketHome = normalizeWorldCupName(home?.name);
  if (fixtureHome === bracketHome) return fixture.score;
  return { home: fixture.score.away, away: fixture.score.home };
}

function applyWorldCupGroupScore(row, goalsFor, goalsAgainst) {
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

function getFixtureTeamName(fixture, side) {
  const teamId = side === "home" ? fixture.homeTeamId : fixture.awayTeamId;
  return teams[teamId]?.name || teamId;
}

function normalizeWorldCupName(value) {
  const clean = String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
  const aliases = {
    "bosnia h": "bosnia and herzegovina",
    "bosnia herz": "bosnia and herzegovina",
    "usa": "united states",
    "united states of america": "united states",
    "cote d ivoire": "ivory coast"
  };
  return aliases[clean] || clean;
}

function loadWorldCupPicks() {
  try {
    const stored = JSON.parse(localStorage.getItem(WORLD_CUP_PICK_STORAGE_KEY) || "{}");
    return stored && typeof stored === "object" ? stored : {};
  } catch {
    return {};
  }
}

function saveWorldCupPicks() {
  localStorage.setItem(WORLD_CUP_PICK_STORAGE_KEY, JSON.stringify(state.bracketUserPicks));
}

function worldCupGroup(name, groupTeams) {
  return { name, teams: groupTeams.map((teamEntry, index) => ({ ...teamEntry, group: name, position: index + 1 })) };
}

function worldCupTeam(code, name, rating) {
  return { code, name, shortName: code, rating };
}

function wcSeed(groupName, rank) {
  return { type: "group", group: groupName, rank };
}

function wcThird(groups) {
  return { type: "third", groups };
}

function wcPrevious(matchId) {
  return { type: "previous", matchId };
}

function wcMatch(id, label, date, venue, home, away) {
  return { id, label, date, venue, home, away };
}

function wcRound(key, label, roundMatches) {
  return { key, label, matches: roundMatches };
}

function renderStatRows(rows) {
  return rows
    .map(
      ([label, value]) => `
        <div class="stat-row">
          <span>${escapeHtml(label)}</span>
          <strong>${escapeHtml(value)}</strong>
        </div>
      `
    )
    .join("");
}

function renderDetailTabState() {
  document.querySelectorAll(".detail-tab").forEach((button) => {
    const isActive = button.dataset.tab === state.detailTab;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-selected", isActive ? "true" : "false");
  });

  document.querySelectorAll(".detail-tab-page").forEach((page) => {
    page.classList.toggle("active", page.id === `${state.detailTab}Tab`);
  });
}

function bindEvents() {
  document.querySelectorAll(".nav-tab").forEach((button) => {
    button.addEventListener("click", () => {
      setActiveView(button.dataset.view);
    });
  });

  selectors.dateInput.addEventListener("change", () => {
    state.selectedDate = selectors.dateInput.value || todayKey;
    renderActiveView();
  });

  selectors.searchInput.addEventListener("input", () => {
    state.search = selectors.searchInput.value;
    renderActiveView();
  });

  document.querySelector("#prevDateButton").addEventListener("click", () => {
    state.selectedDate = formatDateKey(addDays(parseDateKey(state.selectedDate), -1));
    selectors.dateInput.value = state.selectedDate;
    renderActiveView();
  });

  document.querySelector("#nextDateButton").addEventListener("click", () => {
    state.selectedDate = formatDateKey(addDays(parseDateKey(state.selectedDate), 1));
    selectors.dateInput.value = state.selectedDate;
    renderActiveView();
  });

  selectors.matchGroups.addEventListener("click", (event) => {
    const card = event.target.closest("[data-match-id]");
    if (!card) return;
    openMatchDetail(card.dataset.matchId);
  });

  selectors.bracketView.addEventListener("click", (event) => {
    const pickButton = event.target.closest("[data-bracket-pick]");
    if (pickButton && !pickButton.disabled) {
      state.bracketUserPicks[pickButton.dataset.bracketPick] = pickButton.dataset.teamCode;
      state.selectedBracketMatchId = pickButton.dataset.bracketPick;
      saveWorldCupPicks();
      renderWorldCupView();
      return;
    }

    const clearButton = event.target.closest("[data-bracket-clear]");
    if (clearButton && !clearButton.disabled) {
      delete state.bracketUserPicks[clearButton.dataset.bracketClear];
      state.selectedBracketMatchId = clearButton.dataset.bracketClear;
      saveWorldCupPicks();
      renderWorldCupView();
      return;
    }

    const bracketMatch = event.target.closest("[data-bracket-match-id]");
    if (!bracketMatch) return;
    state.selectedBracketMatchId = bracketMatch.dataset.bracketMatchId;
    renderWorldCupView();
  });

  document.querySelector("#backButton").addEventListener("click", closeMatchDetail);

  document.querySelectorAll(".detail-tab").forEach((button) => {
    button.addEventListener("click", () => {
      state.detailTab = button.dataset.tab;
      renderDetailTabState();
    });
  });

  selectors.fixtureJsonFile.addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const payload = JSON.parse(await file.text());
      importFixtureData(payload, { source: file.name });
    } catch (error) {
      setImportStatus(error.message || "Could not import that JSON file.", true);
    }
  });

  selectors.loadFixtureUrlButton.addEventListener("click", async () => {
    selectors.loadFixtureUrlButton.disabled = true;
    setImportStatus("Loading remote fixture JSON...");

    try {
      await loadFixtureDataFromUrl(selectors.fixtureUrlInput.value);
    } catch (error) {
      setImportStatus(error.message || "Could not load that remote JSON URL.", true);
    } finally {
      selectors.loadFixtureUrlButton.disabled = false;
    }
  });

  selectors.loadLiveFeedButton.addEventListener("click", async () => {
    selectors.loadLiveFeedButton.disabled = true;
    setImportStatus("Loading GitHub live fixture feed...");

    try {
      await loadLiveFixtureFeed();
    } catch (error) {
      setImportStatus(error.message || "Could not load the live fixture feed.", true);
    } finally {
      selectors.loadLiveFeedButton.disabled = false;
    }
  });

  selectors.exportFixturesButton.addEventListener("click", exportFixtureJson);
  selectors.resetFixturesButton.addEventListener("click", resetFixtureData);
}

function setActiveView(view, updateUrl = true) {
  state.activeView = view;
  document.querySelectorAll(".nav-tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.view === view));
  state.selectedMatchId = null;
  selectors.detailView.hidden = true;
  if (updateUrl) {
    const nextUrl = view === "worldcup" ? "#worldcup-2026" : `${window.location.pathname}${window.location.search}`;
    history.replaceState(null, "", nextUrl);
  }
  renderActiveView();
}

function getInitialViewFromLocation() {
  return ["#worldcup-2026", "#bracket"].includes(window.location.hash) ? "worldcup" : "today";
}

function init() {
  selectors.dateInput.value = state.selectedDate;
  state.activeView = getInitialViewFromLocation();
  const restoredStoredFixtures = loadStoredFixtureData();
  bindEvents();
  document.querySelectorAll(".nav-tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.view === state.activeView));
  renderActiveView();
  loadLiveFixtureFeed({ persist: false, silent: true }).catch(() => {
    if (!restoredStoredFixtures) {
      setImportStatus("Live feed is not ready yet. Using the built-in demo snapshot.");
    }
  });
}

function renderFixtureSource() {
  selectors.fixtureSourceText.textContent = `${fixtureMeta.source}. Updated ${fixtureMeta.updatedAt}. ${fixtureMeta.note || ""}`;
}

function setImportStatus(message, isError = false) {
  selectors.fixtureImportStatus.textContent = message;
  selectors.fixtureImportStatus.classList.toggle("error", isError);
}

function exportFixtureJson() {
  const json = JSON.stringify(getFixtureDataExport(), null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `goaliq-fixtures-${formatDateKey(new Date())}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  setImportStatus("Exported the current fixture JSON.");
}

function cloneMatch(match) {
  return {
    ...match,
    score: match.score ? { ...match.score } : null
  };
}

function normalizeTeamId(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "")
    .slice(0, 8);
}

function createTeamId(name, league) {
  const base = normalizeTeamId(
    String(name || "")
      .split(/\s+/)
      .map((part) => part[0])
      .join("") || name
  );
  const fallback = normalizeTeamId(`${league || "TEAM"}${Object.keys(teams).length}`);
  let candidate = base || fallback;
  let index = 2;

  while (teams[candidate] && teams[candidate].name.toLowerCase() !== String(name).toLowerCase()) {
    candidate = `${base || fallback}${index}`;
    index += 1;
  }

  return candidate;
}

function findTeamIdByName(name) {
  const clean = normalizeName(name);
  if (!clean) return null;
  const found = Object.values(teams).find((team) => normalizeName(team.name) === clean || normalizeName(team.shortName) === clean);
  return found?.id || null;
}

function normalizeName(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function makeShortName(name) {
  const words = String(name || "")
    .replace(/&/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
  return words.map((word) => word[0]).join("").slice(0, 4).toUpperCase();
}

function ensureLeagueProfile(league) {
  const key = league || "OTHER";
  if (!leagueProfiles[key]) {
    leagueProfiles[key] = {
      name: key,
      shortName: key,
      avgGoals: 2.7,
      homeAdvantage: 0.1,
      order: Object.keys(leagueProfiles).length + 1
    };
  }
  return leagueProfiles[key];
}

function normalizeDate(value) {
  if (!value) return "";
  if (value instanceof Date && !Number.isNaN(value.getTime())) return formatDateKey(value);

  const raw = String(value).trim();
  const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;

  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? "" : formatDateKey(parsed);
}

function normalizeTime(value) {
  if (!value) return "00:00";
  const raw = String(value).trim();
  const direct = raw.match(/\b(\d{1,2}):(\d{2})\b/);
  if (direct) {
    return `${direct[1].padStart(2, "0")}:${direct[2]}`;
  }

  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) {
    return `${String(parsed.getHours()).padStart(2, "0")}:${String(parsed.getMinutes()).padStart(2, "0")}`;
  }

  return "00:00";
}

function sortMatches(a, b) {
  return a.date.localeCompare(b.date) || a.time.localeCompare(b.time);
}

function sortMatchesReverse(a, b) {
  return b.date.localeCompare(a.date) || b.time.localeCompare(a.time);
}

function pairKey(firstId, secondId) {
  return [firstId, secondId].sort().join("_");
}

function blend(primary, secondary, primaryWeight) {
  return primary * primaryWeight + secondary * (1 - primaryWeight);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function addDays(date, days) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function dateKeyFromOffset(offset) {
  return formatDateKey(addDays(new Date(), offset));
}

function parseDateKey(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dateLabel(date) {
  if (date === todayKey) return "Today";
  const tomorrow = formatDateKey(addDays(new Date(), 1));
  const yesterday = formatDateKey(addDays(new Date(), -1));
  if (date === tomorrow) return "Tomorrow";
  if (date === yesterday) return "Yesterday";
  return formatShortDate(date);
}

function formatShortDate(date) {
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(parseDateKey(date));
}

function formatLongDate(date) {
  return new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" }).format(
    parseDateKey(date)
  );
}

function formatMatchTime(match) {
  if (match.status === "live") return `${match.minute}'`;
  if (match.status === "halftime") return "HT";
  if (match.status === "finished") return "FT";
  return match.time;
}

function formatPercent(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return "—";
  return `${Math.round(num * 100)}%`;
}

function formatNumber(value) {
  return Number(value).toFixed(2);
}

function formatStat(value, suffix) {
  if (suffix === "%") return `${Math.round(value)}%`;
  return Number(value).toFixed(value >= 10 ? 1 : 2);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

window.GoalIQServices = {
  getMatchesByDate,
  getLiveMatches,
  getUpcomingMatches,
  getFinishedMatches,
  getMatchDetails,
  getTeamLastFiveMatches,
  calculatePrediction,
  importFixtureData,
  resetFixtureData,
  getFixtureDataExport,
  loadFixtureDataFromUrl,
  loadLiveFixtureFeed,
  getWorldCupBracket
};
window.FootballEdgeServices = window.GoalIQServices;

init();
