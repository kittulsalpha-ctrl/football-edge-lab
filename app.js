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
  LIGUE1: {
    name: "Ligue 1",
    shortName: "Ligue 1",
    avgGoals: 2.74,
    homeAdvantage: 0.11,
    order: 4
  },
  UCL: {
    name: "UEFA Champions League",
    shortName: "UCL",
    avgGoals: 2.96,
    homeAdvantage: 0.08,
    order: 5
  },
  UEL: {
    name: "UEFA Europa League",
    shortName: "UEL",
    avgGoals: 2.78,
    homeAdvantage: 0.08,
    order: 6
  }
};

const focusedLeagueIds = new Set(Object.keys(leagueProfiles));

const statusLabels = {
  upcoming: "Upcoming",
  live: "Live",
  halftime: "Halftime",
  finished: "Finished",
  postponed: "Postponed",
  suspended: "Suspended",
  cancelled: "Cancelled"
};

const todayKey = formatDateKey(new Date());

const seedFixtureMeta = {
  source: "Built-in demo fixture snapshot",
  updatedAt: "2026-04-29",
  note: "Sample today, live, finished, and upcoming fixtures. Import JSON to replace with a real schedule."
};

const liveFeedLoadingMeta = {
  source: "football-data.org live feed",
  updatedAt: "",
  note: "Loading verified fixtures. Demo fixtures are disabled on the public board."
};

const liveFeedUnavailableMeta = {
  source: "football-data.org live feed",
  updatedAt: "",
  note: "Verified fixtures could not be loaded. Demo fixtures are hidden to avoid showing wrong matches."
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
      ["UCL", "Borussia Dortmund", "A", 2, 2],
      ["UCL", "RB Leipzig", "H", 3, 1],
      ["UCL", "Paris Saint-Germain", "A", 1, 0],
      ["UCL", "Inter", "H", 2, 0],
      ["UCL", "Bayer Leverkusen", "A", 1, 1]
    ]
  }),
  BVB: makeTeam("BVB", "Borussia Dortmund", "BVB", 1828, "Signal Iduna Park", {
    attack: [1.86, 14.4, 5.4, 2.8, 1.82],
    defense: [1.22, 33, 1.3, 1.9],
    form: [
      ["UCL", "Bayern Munich", "H", 2, 2],
      ["UCL", "Atletico Madrid", "A", 1, 2],
      ["UCL", "Porto", "H", 3, 0],
      ["UCL", "Benfica", "A", 2, 1],
      ["UCL", "Arsenal", "H", 1, 1]
    ]
  }),
  LEV: makeTeam("LEV", "Bayer Leverkusen", "LEV", 1884, "BayArena", {
    attack: [2.08, 15.7, 6.0, 3.3, 2.06],
    defense: [0.9, 48, 0.94, 1.8],
    form: [
      ["UCL", "Bayern Munich", "H", 1, 1],
      ["UCL", "RB Leipzig", "A", 2, 1],
      ["UCL", "Benfica", "A", 2, 0],
      ["UCL", "Atletico Madrid", "H", 1, 0],
      ["UCL", "Chelsea", "H", 3, 1]
    ]
  }),
  RBL: makeTeam("RBL", "RB Leipzig", "RBL", 1818, "Red Bull Arena", {
    attack: [1.82, 14.1, 5.2, 2.7, 1.79],
    defense: [1.06, 40, 1.09, 1.7],
    form: [
      ["UCL", "Bayern Munich", "A", 1, 3],
      ["UCL", "Bayer Leverkusen", "H", 1, 2],
      ["UCL", "Porto", "A", 2, 0],
      ["UCL", "Benfica", "H", 2, 1],
      ["UCL", "Inter", "A", 1, 1]
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
  TOR: quickTeam("TOR", "Torino", "TOR", 1666, "Stadio Olimpico Grande Torino", "SERIEA")
};

const matches = [
  makeMatch("today-epl-mun-che", 0, "EPL", "18:30", "MUN", "CHE", "live", "Old Trafford", { home: 1, away: 1, minute: 67 }),
  makeMatch("today-epl-ars-liv", 0, "EPL", "20:45", "ARS", "LIV", "upcoming", "Emirates Stadium"),
  makeMatch("today-laliga-rma-bar", 0, "LALIGA", "16:00", "RMA", "BAR", "finished", "Santiago Bernabeu", { home: 2, away: 1 }),
  makeMatch("today-seriea-int-juv", 0, "SERIEA", "17:15", "INT", "JUV", "halftime", "San Siro", { home: 0, away: 0, minute: 45 }),
  makeMatch("today-ucl-psg-atm", 0, "UCL", "22:00", "PSG", "ATM", "upcoming", "Parc des Princes", null, "Semi-final watchlist"),
  makeMatch("ucl-psg-bay-1", 1, "UCL", "00:30", "PSG", "BAY", "upcoming", "Parc des Princes", null, "Semi-final - Leg 1 of 2"),
  makeMatch("ucl-atm-ars-1", 2, "UCL", "00:30", "ATM", "ARS", "upcoming", "Metropolitano Stadium", null, "Semi-final - Leg 1 of 2"),
  makeMatch("epl-lee-bur", 4, "EPL", "00:30", "LEE", "BUR", "upcoming", "Elland Road"),
  makeMatch("epl-bre-whu", 4, "EPL", "19:30", "BRE", "WHU", "upcoming", "Gtech Community Stadium"),
  makeMatch("epl-wol-sun", 4, "EPL", "19:30", "WOL", "SUN", "upcoming", "Molineux"),
  makeMatch("epl-new-bha", 4, "EPL", "19:30", "NEW", "BHA", "upcoming", "St James' Park"),
  makeMatch("epl-ars-ful", 4, "EPL", "22:00", "ARS", "FUL", "upcoming", "Emirates Stadium"),
  makeMatch("epl-bou-cry", 5, "EPL", "18:30", "BOU", "CRY", "upcoming", "Vitality Stadium"),
  makeMatch("epl-mun-liv", 5, "EPL", "20:00", "MUN", "LIV", "upcoming", "Old Trafford"),
  makeMatch("epl-avl-tot", 5, "EPL", "23:30", "AVL", "TOT", "upcoming", "Villa Park"),
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
const historicalMatches = [];

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
  topPicksPanel: document.querySelector("#topPicksPanel"),
  topPicksTitle: document.querySelector("#topPicksTitle"),
  topPicksMeta: document.querySelector("#topPicksMeta"),
  topPicksList: document.querySelector("#topPicksList"),
  homeView: document.querySelector("#homeView"),
  detailView: document.querySelector("#detailView"),
  detailStatus: document.querySelector("#detailStatus"),
  detailLeague: document.querySelector("#detailLeague"),
  detailTitle: document.querySelector("#detailTitle"),
  detailMeta: document.querySelector("#detailMeta"),
  detailTrustBar: document.querySelector("#detailTrustBar"),
  detailScoreboard: document.querySelector("#detailScoreboard"),
  scorePredictionLabel: document.querySelector("#scorePredictionLabel"),
  predictedScore: document.querySelector("#predictedScore"),
  probabilityPanelTitle: document.querySelector("#probabilityPanelTitle"),
  confidenceLevel: document.querySelector("#confidenceLevel"),
  probabilityCards: document.querySelector("#probabilityCards"),
  overviewRows: document.querySelector("#overviewRows"),
  modelBreakdownSummary: document.querySelector("#modelBreakdownSummary"),
  modelBreakdownRows: document.querySelector("#modelBreakdownRows"),
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
  detailTab: "overview",
  renderTimer: null
};

function quickTeam(id, name, shortName, rating, venue, league) {
  const strength = clamp((rating - 1600) / 300, -0.4, 1.05);
  const opponentsByLeague = {
    EPL: ["Everton", "West Ham", "Fulham", "Brentford", "Bournemouth", "Newcastle United"],
    LALIGA: ["Sevilla", "Valencia", "Getafe", "Osasuna", "Mallorca", "Villarreal"],
    SERIEA: ["Torino", "Udinese", "Bologna", "Lazio", "Genoa", "Fiorentina"],
    LIGUE1: ["Rennes", "Lille", "Nice", "Monaco", "Lens", "Lyon"],
    UCL: ["Benfica", "Porto", "Ajax", "Celtic", "Sporting CP", "Monaco"],
    UEL: ["Real Betis", "Roma", "Fenerbahce", "Lyon", "Porto", "Freiburg"]
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
  return {
    id,
    name,
    shortName,
    rating,
    venue,
    attacking: {
      avgGoals: null,
      shots: null,
      shotsOnTarget: null,
      bigChances: null,
      xg: null,
      expectedGoalsModel: null
    },
    defensive: {
      goalsConcededAvg: null,
      cleanSheetPct: null,
      xga: null,
      cards: null,
      expectedGoalsAgainstModel: null
    },
    form: [],
    dataProvenance: createUnavailableTeamProvenance(league)
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
    dataProvenance: cloneDataProvenance(team.dataProvenance),
    form: Array.isArray(team.form) ? team.form.map((match) => ({ ...match })) : []
  };
}

function buildTeamProfileFromForm(form, seedRating = 1600) {
  const recent = Array.isArray(form)
    ? form.filter((match) => Number.isFinite(Number(match.goalsFor)) && Number.isFinite(Number(match.goalsAgainst)))
    : [];
  if (!recent.length) return null;

  const totals = recent.reduce(
    (summary, match) => {
      const goalsFor = Number(match.goalsFor);
      const goalsAgainst = Number(match.goalsAgainst);
      const result = resultFor(goalsFor, goalsAgainst);
      summary.goalsFor += goalsFor;
      summary.goalsAgainst += goalsAgainst;
      summary.cleanSheets += goalsAgainst === 0 ? 1 : 0;
      summary.failedToScore += goalsFor === 0 ? 1 : 0;
      summary.points += result === "W" ? 3 : result === "D" ? 1 : 0;
      return summary;
    },
    { goalsFor: 0, goalsAgainst: 0, cleanSheets: 0, failedToScore: 0, points: 0 }
  );

  const matchesPlayed = recent.length;
  const avgGoals = totals.goalsFor / matchesPlayed;
  const avgAgainst = totals.goalsAgainst / matchesPlayed;
  const pointsPerMatch = totals.points / matchesPlayed;
  const goalDifferencePerMatch = (totals.goalsFor - totals.goalsAgainst) / matchesPlayed;
  const cleanSheetPct = (totals.cleanSheets / matchesPlayed) * 100;
  const ratingBase = Number.isFinite(Number(seedRating)) ? Number(seedRating) : 1600;

  return {
    rating: Math.round(clamp(ratingBase + (pointsPerMatch - 1.35) * 95 + goalDifferencePerMatch * 70 + (cleanSheetPct - 30) * 1.1, 1380, 2025)),
    attacking: {
      avgGoals: roundMetric(avgGoals),
      shots: null,
      shotsOnTarget: null,
      bigChances: null,
      xg: null,
      expectedGoalsModel: null
    },
    defensive: {
      goalsConcededAvg: roundMetric(avgAgainst),
      cleanSheetPct: Math.round(cleanSheetPct),
      xga: null,
      cards: null,
      expectedGoalsAgainstModel: null
    },
    dataProvenance: createDerivedTeamProvenance()
  };
}

function createUnavailableTeamProvenance(league) {
  return {
    source: "imported-fixture-feed",
    league,
    attacking: {
      avgGoals: unavailableProvenance(),
      shots: unavailableProvenance(),
      shotsOnTarget: unavailableProvenance(),
      bigChances: unavailableProvenance(),
      xg: unavailableProvenance()
    },
    defensive: {
      goalsConcededAvg: unavailableProvenance(),
      cleanSheetPct: unavailableProvenance(),
      xga: unavailableProvenance(),
      cards: unavailableProvenance()
    }
  };
}

function createDerivedTeamProvenance() {
  return {
    source: "verified-result-feed",
    attacking: {
      avgGoals: derivedProvenance("recent-finished-results"),
      shots: unavailableProvenance(),
      shotsOnTarget: unavailableProvenance(),
      bigChances: unavailableProvenance(),
      xg: unavailableProvenance()
    },
    defensive: {
      goalsConcededAvg: derivedProvenance("recent-finished-results"),
      cleanSheetPct: derivedProvenance("recent-finished-results"),
      xga: unavailableProvenance(),
      cards: unavailableProvenance()
    }
  };
}

function derivedProvenance(method) {
  return {
    sourceType: "derived",
    source: "verified result feed",
    method,
    verified: false
  };
}

function unavailableProvenance() {
  return {
    sourceType: "unavailable",
    source: null,
    verified: false
  };
}

function cloneDataProvenance(provenance) {
  if (!provenance || typeof provenance !== "object") return null;
  return JSON.parse(JSON.stringify(provenance));
}

function roundMetric(value, digits = 2) {
  return Number(value.toFixed(digits));
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
    dataProvenance: createDemoTeamProvenance(),
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

function createDemoTeamProvenance() {
  return {
    source: "built-in-demo-snapshot",
    attacking: {
      avgGoals: demoProvenance(),
      shots: demoProvenance(),
      shotsOnTarget: demoProvenance(),
      bigChances: demoProvenance(),
      xg: demoProvenance()
    },
    defensive: {
      goalsConcededAvg: demoProvenance(),
      cleanSheetPct: demoProvenance(),
      xga: demoProvenance(),
      cards: demoProvenance()
    }
  };
}

function demoProvenance() {
  return {
    sourceType: "demo",
    source: "built-in demo snapshot",
    verified: false
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
    .filter((match) => isFocusedMatch(match) && match.date === date)
    .sort(sortMatches);
}

function getLiveMatches() {
  return matches
    .filter((match) => isFocusedMatch(match) && (match.status === "live" || match.status === "halftime"))
    .sort(sortMatches);
}

function getUpcomingMatches() {
  return matches
    .filter((match) => isFocusedMatch(match) && isUpcomingStatus(match.status) && match.date === state.selectedDate)
    .sort(sortMatches);
}

function isUpcomingStatus(status) {
  return ["upcoming", "postponed", "suspended", "cancelled"].includes(status);
}

function getNextUpcomingMatchDate(fromDate = state.selectedDate, options = {}) {
  const includeSelectedDate = options.includeSelectedDate !== false;
  const sortedDates = [
    ...new Set(
      matches
        .filter((match) => isFocusedMatch(match) && isUpcomingStatus(match.status) && match.date)
        .map((match) => match.date)
    )
  ].sort();

  return (
    sortedDates.find((date) => (includeSelectedDate ? date >= fromDate : date > fromDate)) ||
    sortedDates[0] ||
    null
  );
}

function moveToUpcomingMatchday() {
  if (state.activeView !== "upcoming") return;
  const fromDate = state.selectedDate <= todayKey ? todayKey : state.selectedDate;
  const includeSelectedDate = state.selectedDate > todayKey;
  const nextDate = getNextUpcomingMatchDate(fromDate, { includeSelectedDate });
  if (!nextDate || nextDate === state.selectedDate) return;
  state.selectedDate = nextDate;
  selectors.dateInput.value = nextDate;
}

function getFinishedMatches() {
  const finishedMatches = matches.filter((match) => isFocusedMatch(match) && match.status === "finished");
  const finishedUpToSelectedDate = finishedMatches.filter((match) => match.date <= state.selectedDate);
  const visibleFinished = finishedUpToSelectedDate.length ? finishedUpToSelectedDate : finishedMatches;
  return visibleFinished.sort(sortMatchesReverse);
}

function isFocusedMatch(match) {
  return Boolean(match && isFocusedLeague(match.league));
}

function isFocusedLeague(league) {
  const key = normalizeLeague(league);
  return focusedLeagueIds.has(key);
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
  historicalMatches.splice(0, historicalMatches.length, ...normalized.historicalMatches.map(cloneHistoricalMatch));
  fixtureMeta = normalized.meta;

  if (options.persist !== false) {
    localStorage.setItem(FIXTURE_STORAGE_KEY, JSON.stringify(getFixtureDataExport()));
  }

  state.selectedMatchId = null;
  selectors.detailView.hidden = true;
  selectors.homeView.hidden = false;
  renderFixtureSource();
  moveToUpcomingMatchday();
  renderActiveView();
  setImportStatus(`Loaded ${matches.length} fixtures from ${fixtureMeta.source}.`);
  return getFixtureDataExport();
}

function resetFixtureData() {
  resetTeamsToSeed();
  matches.splice(0, matches.length, ...seedMatches.map(cloneMatch));
  historicalMatches.splice(0, historicalMatches.length);
  fixtureMeta = { ...seedFixtureMeta };
  localStorage.removeItem(FIXTURE_STORAGE_KEY);
  if (selectors.fixtureJsonFile) selectors.fixtureJsonFile.value = "";
  if (selectors.fixtureUrlInput) selectors.fixtureUrlInput.value = "";
  state.selectedMatchId = null;
  selectors.detailView.hidden = true;
  selectors.homeView.hidden = false;
  renderFixtureSource();
  moveToUpcomingMatchday();
  renderActiveView();
  setImportStatus("Loaded demo fixtures for testing only. Use the live feed before sharing predictions.");
}

function clearFixtureBoard(meta = liveFeedUnavailableMeta, options = {}) {
  resetTeamsToSeed();
  matches.splice(0, matches.length);
  historicalMatches.splice(0, historicalMatches.length);
  fixtureMeta = { ...meta };
  localStorage.removeItem(FIXTURE_STORAGE_KEY);
  state.selectedMatchId = null;
  selectors.detailView.hidden = true;
  selectors.homeView.hidden = false;
  renderFixtureSource();
  moveToUpcomingMatchday();
  renderActiveView();
  if (options.message) setImportStatus(options.message, options.isError);
}

function getFixtureDataExport() {
  const teamIds = [...new Set(matches.flatMap((match) => [match.homeTeamId, match.awayTeamId]))];
  return {
    meta: {
      ...fixtureMeta,
      exportedAt: new Date().toISOString()
    },
    teams: teamIds.map((teamId) => exportTeam(teams[teamId])).filter(Boolean),
    historicalMatches: historicalMatches.map(cloneHistoricalMatch),
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


function loadStoredFixtureData() {
  const raw = localStorage.getItem(FIXTURE_STORAGE_KEY);
  if (!raw) {
    renderFixtureSource();
    return false;
  }

  try {
    const normalized = normalizeFixturePayload(JSON.parse(raw), "Browser storage");
    matches.splice(0, matches.length, ...normalized.matches.map(cloneMatch));
    historicalMatches.splice(0, historicalMatches.length, ...normalized.historicalMatches.map(cloneHistoricalMatch));
    fixtureMeta = normalized.meta;
    renderFixtureSource();
    return true;
  } catch {
      localStorage.removeItem(FIXTURE_STORAGE_KEY);
      fixtureMeta = { ...seedFixtureMeta };
      historicalMatches.splice(0, historicalMatches.length);
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
  const normalizedHistoricalMatches = normalizeImportedHistoricalMatches(payload);
  if (!normalizedMatches.length) throw new Error("No valid fixtures were found in that JSON.");

  return {
    meta: {
      source: payload?.meta?.source || payload?.source || fallbackSource,
      updatedAt: payload?.meta?.updatedAt || payload?.updatedAt || new Date().toISOString().slice(0, 10),
      note: payload?.meta?.note || "Imported fixture data"
    },
    historicalMatches: normalizedHistoricalMatches,
    matches: normalizedMatches.sort(sortMatches)
  };
}

function normalizeImportedHistoricalMatches(payload) {
  const rawHistory = payload?.historicalMatches || payload?.history || [];
  if (!Array.isArray(rawHistory)) return [];
  return rawHistory.map(normalizeImportedHistoricalMatch).filter(Boolean).sort(sortMatches);
}

function normalizeImportedHistoricalMatch(match, index) {
  if (!match || typeof match !== "object") return null;

  const league = normalizeLeague(match.league || match.competition || match.competitionId);
  if (!isFocusedLeague(league)) return null;
  const date = normalizeDate(match.date || match.kickoffDate || match.utcDate || match.kickoff);
  const time = normalizeTime(match.time || match.kickoffTime || match.utcTime || match.kickoff || match.utcDate);
  const homeTeamId = resolveTeamForMatch(match.homeTeamId || match.homeId, match.homeTeam || match.home || match.homeName, league);
  const awayTeamId = resolveTeamForMatch(match.awayTeamId || match.awayId, match.awayTeam || match.away || match.awayName, league);
  const score = normalizeScore(match.score) || normalizeScore({ home: match.homeGoals, away: match.awayGoals });

  if (!league || !date || !homeTeamId || !awayTeamId || homeTeamId === awayTeamId || !score) return null;

  return {
    id: String(match.id || match.matchId || `history-${league}-${date}-${homeTeamId}-${awayTeamId}-${index}`).toLowerCase(),
    competitionId: league,
    league,
    season: match.season || "",
    date,
    time,
    kickoff: match.kickoff || `${date}T${time}:00`,
    homeTeamId,
    awayTeamId,
    homeTeam: match.homeTeam || teams[homeTeamId]?.name || homeTeamId,
    awayTeam: match.awayTeam || teams[awayTeamId]?.name || awayTeamId,
    homeGoals: Number(score.home),
    awayGoals: Number(score.away),
    halftimeHomeGoals: toFiniteOrNull(match.halftimeHomeGoals),
    halftimeAwayGoals: toFiniteOrNull(match.halftimeAwayGoals),
    homeShots: toFiniteOrNull(match.homeShots),
    awayShots: toFiniteOrNull(match.awayShots),
    homeShotsOnTarget: toFiniteOrNull(match.homeShotsOnTarget),
    awayShotsOnTarget: toFiniteOrNull(match.awayShotsOnTarget),
    homeXg: toFiniteOrNull(match.homeXg),
    awayXg: toFiniteOrNull(match.awayXg),
    source: match.source || "imported historical feed",
    sourceQuality: match.sourceQuality || {
      fixture: "provider",
      score: "provider",
      advancedStats: "unavailable"
    }
  };
}

function normalizeImportedTeam(team) {
  if (!team || typeof team !== "object") return null;
  const name = String(team.name || team.team || "").trim();
  if (!name) return null;

  const league = normalizeLeague(team.league || team.competition || "EPL");
  if (!isFocusedLeague(league)) return null;
  const id = normalizeTeamId(team.id || team.teamId || createTeamId(name, league));
  const existingId = findTeamIdByName(name) || id;
  const existingTeam = teams[existingId];
  const base = makeImportedTeam(
    existingId,
    name,
    team.shortName || existingTeam?.shortName || makeShortName(name),
    Number(team.rating) || existingTeam?.rating || 1600,
    team.venue || existingTeam?.venue || "",
    league
  );
  const importedForm = normalizeImportedForm(team.form);
  const suppliedRating = Number(team.rating);
  const ratingSeed = Number.isFinite(suppliedRating) ? suppliedRating : base.rating;
  const formProfile = buildTeamProfileFromForm(importedForm, ratingSeed);

  teams[existingId] = {
    ...base,
    id: existingId,
    name,
    shortName: String(team.shortName || team.abbreviation || base.shortName || makeShortName(name)).slice(0, 4).toUpperCase(),
    rating: formProfile?.rating || ratingSeed || base.rating,
    venue: team.venue || base.venue || "",
    attacking: {
      ...base.attacking,
      ...(formProfile?.attacking || {})
    },
    defensive: {
      ...base.defensive,
      ...(formProfile?.defensive || {})
    },
    dataProvenance: formProfile?.dataProvenance || base.dataProvenance || createUnavailableTeamProvenance(league),
    form: importedForm
  };

  return teams[existingId];
}

function normalizeImportedMatch(match, index) {
  if (!match || typeof match !== "object") return null;

  const league = normalizeLeague(match.league || match.competition);
  if (!isFocusedLeague(league)) return null;
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
    "ligue 1": "LIGUE1",
    "french league": "LIGUE1",
    fl1: "LIGUE1",
    "uefa champions league": "UCL",
    "champions league": "UCL",
    cl: "UCL",
    ucl: "UCL",
    "uefa europa league": "UEL",
    "europa league": "UEL",
    uel: "UEL",
    el: "UEL"
  };
  return aliases[clean] || raw.toUpperCase();
}

function normalizeStatus(status, date, score) {
  const clean = String(status || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
  if (["live", "halftime", "finished", "upcoming", "postponed", "suspended", "cancelled"].includes(clean)) return clean;
  if (["ft", "fulltime", "awarded"].includes(clean)) return "finished";
  if (["ht", "halftime", "paused"].includes(clean)) return "halftime";
  if (["scheduled", "timed", "tbd"].includes(clean)) return "upcoming";
  if (["inplay"].includes(clean)) return "live";
  if (["postponed", "ppd"].includes(clean)) return "postponed";
  if (["suspended"].includes(clean)) return "suspended";
  if (["cancelled", "canceled"].includes(clean)) return "cancelled";
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
        const goalsFor = toFiniteOrNull(match[3]);
        const goalsAgainst = toFiniteOrNull(match[4]);
        if (!Number.isFinite(goalsFor) || !Number.isFinite(goalsAgainst)) return null;
        return {
          date: formatDateKey(addDays(new Date(), -(index + 1) * 7)),
          competition: normalizeLeague(match[0] || "EPL"),
          opponent: String(match[1] || "Opponent"),
          venue: String(match[2] || "H"),
          goalsFor,
          goalsAgainst
        };
      }
      if (!match || typeof match !== "object") return null;
      const goalsFor = toFiniteOrNull(match.goalsFor ?? match.gf);
      const goalsAgainst = toFiniteOrNull(match.goalsAgainst ?? match.ga);
      if (!Number.isFinite(goalsFor) || !Number.isFinite(goalsAgainst)) return null;
      return {
        date: normalizeDate(match.date) || formatDateKey(addDays(new Date(), -(index + 1) * 7)),
        competition: normalizeLeague(match.competition || match.league || "EPL"),
        opponent: String(match.opponent || "Opponent"),
        venue: String(match.venue || match.side || "H"),
        goalsFor,
        goalsAgainst
      };
    })
    .filter((match) => match && isFocusedLeague(match.competition))
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
    dataProvenance: team.dataProvenance,
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
  const engine = window.GoalIQPredictionEngine;
  if (!engine?.predictMatchV2) {
    throw new Error("GoalIQ Prediction Engine v2 failed to load.");
  }

  return engine.predictMatchV2({
    match: matchData,
    matches: [...historicalMatches, ...matches],
    teams,
    leagueProfiles,
    fixtureMeta
  });
}

function getHeadToHead(homeTeamId, awayTeamId) {
  const feedMeetings = getFixtureHeadToHead(homeTeamId, awayTeamId);
  if (feedMeetings.length) return feedMeetings;

  const seededMeetings = headToHead[pairKey(homeTeamId, awayTeamId)];
  if (seededMeetings) return seededMeetings;

  if (!seedTeams[homeTeamId] || !seedTeams[awayTeamId]) return [];
  return generateHeadToHead(homeTeamId, awayTeamId);
}

function getFixtureHeadToHead(homeTeamId, awayTeamId) {
  return matches
    .filter(
      (match) =>
        match.score &&
        match.status === "finished" &&
        ((match.homeTeamId === homeTeamId && match.awayTeamId === awayTeamId) ||
          (match.homeTeamId === awayTeamId && match.awayTeamId === homeTeamId))
    )
    .map((match) => ({
      date: match.date,
      competition: match.league,
      homeTeamId: match.homeTeamId,
      awayTeamId: match.awayTeamId,
      homeGoals: match.score.home,
      awayGoals: match.score.away,
      venue: match.venue
    }))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);
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

function resultFor(goalsFor, goalsAgainst) {
  if (goalsFor > goalsAgainst) return "W";
  if (goalsFor === goalsAgainst) return "D";
  return "L";
}

function renderBoardWithLoading() {
  selectors.homeView.hidden = false;
  selectors.detailView.hidden = true;
  selectors.loadingState.hidden = false;
  selectors.matchGroups.hidden = true;
  selectors.topPicksPanel.hidden = true;
  selectors.emptyState.hidden = true;
  clearTimeout(state.renderTimer);
  state.renderTimer = setTimeout(() => {
    renderBoard();
    selectors.loadingState.hidden = true;
    selectors.matchGroups.hidden = state.activeView === "picks";
  }, 140);
}

function renderActiveView() {
  renderBoardWithLoading();
}

function renderBoard() {
  if (state.activeView === "picks") {
    renderTopPicksView();
    return;
  }

  const allMatches = getMatchesForActiveView();
  const visibleMatches = filterMatches(allMatches);
  selectors.headerMatchCount.textContent = `${visibleMatches.length} ${visibleMatches.length === 1 ? "match" : "matches"}`;
  renderEmptyState(visibleMatches.length, allMatches.length);
  selectors.topPicksPanel.hidden = true;
  selectors.topPicksList.innerHTML = "";

  if (!visibleMatches.length) {
    selectors.matchGroups.innerHTML = "";
    return;
  }

  selectors.matchGroups.innerHTML = groupByLeague(visibleMatches)
    .map(renderLeagueGroup)
    .join("");
}

function renderEmptyState(visibleCount, totalCount) {
  selectors.emptyState.hidden = visibleCount > 0;
  if (visibleCount > 0) return;

  const hasSearch = Boolean(state.search.trim());
  const copy = hasSearch
    ? {
        title: "No matching fixtures",
        body: totalCount
          ? "Clear the search or try another team, league, or date."
          : "No fixtures are available in this view yet."
      }
    : getEmptyStateCopyForView();

  selectors.emptyState.innerHTML = `
    <strong>${escapeHtml(copy.title)}</strong>
    <span>${escapeHtml(copy.body)}</span>
  `;
}

function getEmptyStateCopyForView() {
  if (state.activeView === "live") {
    return {
      title: "No live matches right now",
      body: "Live fixtures will appear here automatically when the feed reports an in-play match."
    };
  }
  if (state.activeView === "finished") {
    return {
      title: "No finished results yet",
      body: "Completed matches will appear here once the live feed publishes final scores."
    };
  }
  if (state.activeView === "upcoming") {
    const nextDate = getNextUpcomingMatchDate(state.selectedDate, { includeSelectedDate: false });
    return {
      title: `No upcoming fixtures on ${dateLabel(state.selectedDate)}`,
      body: nextDate
        ? `Next available matchday is ${formatLongDate(nextDate)}.`
        : "Try a later date or refresh the live fixture feed."
    };
  }
  if (state.activeView === "picks") {
    return {
      title: "No top picks available",
      body: "GoalIQ needs live or upcoming fixtures with enough data before it can rank safer angles."
    };
  }
  return {
    title: "No matches on this date",
    body: "Move the date selector or load the latest fixture feed."
  };
}

function renderTopPicksView() {
  const allMatches = getTopPickCandidateMatches();
  const visibleMatches = filterMatches(allMatches);
  const picks = getTopPicks(visibleMatches, 12);

  selectors.headerMatchCount.textContent = `${picks.length} ${picks.length === 1 ? "pick" : "picks"}`;
  selectors.matchGroups.innerHTML = "";
  selectors.matchGroups.hidden = true;
  renderEmptyState(picks.length, allMatches.length);

  if (!picks.length) {
    selectors.topPicksPanel.hidden = true;
    selectors.topPicksList.innerHTML = "";
    return;
  }

  const horizonEnd = formatDateKey(addDays(parseDateKey(state.selectedDate), 14));
  selectors.topPicksTitle.textContent = "Top Picks";
  selectors.topPicksMeta.textContent = `${picks.length} safer ${picks.length === 1 ? "angle" : "angles"} from ${dateLabel(state.selectedDate)} to ${formatShortDate(horizonEnd)}. Analysis only.`;
  selectors.topPicksList.innerHTML = picks.map(renderTopPickCard).join("");
  selectors.topPicksPanel.hidden = false;
}

function getTopPickCandidateMatches() {
  const fromDate = state.selectedDate;
  const toDate = formatDateKey(addDays(parseDateKey(fromDate), 14));
  return matches
    .filter((match) => isFocusedMatch(match) && match.status !== "finished" && !isInactiveStatus(match.status))
    .filter((match) => !match.date || (match.date >= fromDate && match.date <= toDate))
    .sort(sortMatches);
}

function getTopPicks(candidateMatches, limit = 4) {
  return candidateMatches
    .filter((match) => match.status !== "finished")
    .map((match) => {
      const details = getMatchDetails(match.id);
      if (!details) return null;
      const prediction = calculatePrediction(details);
      const pick = prediction.marketEdges?.recommended;
      if (!pick) return null;

      const rankScore =
        pick.probability * (0.72 + prediction.dataQuality.score * 0.18) +
        prediction.confidenceScore * 0.08 +
        (pick.risk === "Lower risk" ? 0.03 : pick.risk === "Balanced" ? 0.015 : 0);

      return {
        match,
        details,
        prediction,
        pick,
        rankScore
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.rankScore - a.rankScore)
    .slice(0, limit);
}

function renderTopPickCard(item, index) {
  const { match, details, prediction, pick } = item;
  const reason = prediction.insights[0] || pick.reason;
  const scoreLabel = match.score ? `${match.score.home}-${match.score.away}` : formatMatchTime(match);

  return `
    <button class="top-pick-card" type="button" data-match-id="${escapeHtml(match.id)}">
      <div class="top-pick-rank">#${index + 1}</div>
      <div class="top-pick-main">
        <div class="top-pick-league">${escapeHtml(details.leagueProfile.shortName)} - ${escapeHtml(scoreLabel)}</div>
        <strong>${escapeHtml(details.homeTeam.shortName)} vs ${escapeHtml(details.awayTeam.shortName)}</strong>
        <span>${escapeHtml(details.homeTeam.name)} vs ${escapeHtml(details.awayTeam.name)}</span>
      </div>
      <div class="top-pick-signal">
        <span>Safer angle</span>
        <strong>${escapeHtml(pick.label)}</strong>
        <em>${formatPercent(pick.probability)} model probability</em>
      </div>
      <div class="top-pick-badges">
        <span class="quality-pill ${prediction.dataQuality.level}">${escapeHtml(prediction.dataQuality.label)} data</span>
        <span>${escapeHtml(prediction.confidence)} confidence</span>
        <span>${escapeHtml(pick.risk)}</span>
      </div>
      <p>${escapeHtml(reason)}</p>
    </button>
  `;
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
    <section class="league-group" data-league="${escapeHtml(group.league)}">
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
  const status = getStatusLabel(match.status);
  const scoreLabel = match.score ? `${match.score.home}-${match.score.away}` : "vs";
  const contextLabel = formatMatchContext(match, details);
  const matchLabel = `${details.homeTeam.name} vs ${details.awayTeam.name}`;

  return `
    <button class="match-card" type="button" data-match-id="${escapeHtml(match.id)}" aria-label="${escapeHtml(matchLabel)}">
      <div class="match-meta">
        <span class="match-time">${formatMatchTime(match)}</span>
        <span class="status-chip ${escapeHtml(match.status)}">${status}</span>
      </div>
      <div class="match-teams">
        <span class="team-side home">
          <span class="team-badge">${escapeHtml(details.homeTeam.shortName)}</span>
          <strong>${escapeHtml(details.homeTeam.name)}</strong>
        </span>
        <span class="match-score">${scoreLabel}</span>
        <span class="team-side away">
          <strong>${escapeHtml(details.awayTeam.name)}</strong>
          <span class="team-badge away">${escapeHtml(details.awayTeam.shortName)}</span>
        </span>
      </div>
      <div class="board-picks" aria-label="Prediction percentages">
        ${renderPick("Home", prediction.probabilities.home)}
        ${renderPick("Draw", prediction.probabilities.draw)}
        ${renderPick("Away", prediction.probabilities.away)}
      </div>
      ${renderCardRecommendation(prediction)}
      <div class="card-footer">
        <span>${escapeHtml(contextLabel)}</span>
      </div>
    </button>
  `;
}

function renderCardRecommendation(prediction) {
  const pick = prediction.marketEdges?.recommended;
  if (!pick) return "";
  return `
    <div class="safe-pick-mini">
      <span>Safer angle</span>
      <strong>${escapeHtml(pick.label)}</strong>
      <em>${formatPercent(pick.probability)} - ${escapeHtml(pick.risk)}</em>
    </div>
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
  selectors.detailView.hidden = false;
  renderDetail();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function closeMatchDetail() {
  state.selectedMatchId = null;
  selectors.detailView.hidden = true;
  selectors.homeView.hidden = false;
  renderBoardWithLoading();
}

function renderDetail() {
  const details = getMatchDetails(state.selectedMatchId);
  if (!details) return;

  const prediction = calculatePrediction(details);
  const scoreDisplay = getDetailScoreDisplay(details, prediction);
  const isFinished = details.status === "finished";
  const isInactive = isInactiveStatus(details.status);
  selectors.detailStatus.textContent = getStatusLabel(details.status);
  selectors.detailStatus.className = `status-chip ${details.status}`;
  selectors.detailLeague.textContent = details.leagueProfile.name;
  selectors.detailTitle.textContent = `${details.homeTeam.name} vs ${details.awayTeam.name}`;
  selectors.detailMeta.textContent = `${formatLongDate(details.date)} - ${details.time} - ${details.stage ? `${details.stage} - ` : ""}${details.venue}`;
  selectors.detailTrustBar.innerHTML = renderDetailTrustBar(details, prediction);
  selectors.detailScoreboard.innerHTML = renderDetailScoreboard(details, scoreDisplay, prediction);
  selectors.scorePredictionLabel.textContent = scoreDisplay.label;
  selectors.predictedScore.textContent = scoreDisplay.value;
  selectors.probabilityPanelTitle.textContent = isInactive ? "Paused probability" : isFinished ? "Pre-match probability" : "Winning probability";
  selectors.confidenceLevel.textContent = isInactive ? "Fixture inactive" : isFinished ? "Finished result" : `${prediction.confidence} confidence`;
  selectors.extraPredictionsTitle.textContent = isInactive ? "Paused predictions" : isFinished ? "Archived predictions" : "Extra predictions";
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
    ["Status", getStatusLabel(details.status)],
    ...(details.score ? [[scoreDisplay.label, `${details.homeTeam.shortName} ${details.score.home} - ${details.score.away} ${details.awayTeam.shortName}`]] : []),
    ["Expected scoring model", `${formatNumber(prediction.expectedGoals.home)} - ${formatNumber(prediction.expectedGoals.away)}`],
    ["Data quality", `${prediction.dataQuality.label} (${prediction.dataQuality.scorePercent}/100) - ${prediction.dataQuality.summary}`],
    ["Feed freshness", prediction.dataQuality.freshness],
    ["Model version", prediction.metadata.modelVersion],
    ["Last update", formatTimestamp(prediction.metadata.fixtureDataUpdatedAt || prediction.metadata.generatedAt)],
    ["Safer angle", `${prediction.marketEdges.recommended.label} (${formatPercent(prediction.marketEdges.recommended.probability)})`]
  ]);

  selectors.modelBreakdownSummary.textContent = prediction.modelBreakdown.summary;
  selectors.modelBreakdownRows.innerHTML = renderModelBreakdown(prediction.modelBreakdown);

  selectors.extraPredictions.innerHTML = `
    ${renderRecommendationPanel(prediction)}
    ${[
      ["Over 1.5 goals", prediction.probabilities.over15],
      ["Over 2.5 goals", prediction.probabilities.over25],
      ["Under 3.5 goals", prediction.probabilities.under35],
      ["Both teams to score", prediction.probabilities.btts],
      [`${details.homeTeam.shortName} clean sheet`, prediction.probabilities.homeCleanSheet],
      [`${details.awayTeam.shortName} clean sheet`, prediction.probabilities.awayCleanSheet],
      ["First half goal", prediction.probabilities.firstHalfGoal]
    ]
      .map(([label, value]) => renderMarketTile(label, value))
      .join("")}
  `;

  selectors.formGrid.innerHTML = [
    renderFormPanel(details.homeTeam, prediction.form.home),
    renderFormPanel(details.awayTeam, prediction.form.away)
  ].join("");

  selectors.attackingStats.innerHTML = renderProvenanceComparisonRows(details.homeTeam, details.awayTeam, prediction.statistics.attacking);

  selectors.defensiveStats.innerHTML = renderProvenanceComparisonRows(details.homeTeam, details.awayTeam, prediction.statistics.defensive);

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

function renderDetailTrustBar(details, prediction) {
  return `
    <span>${escapeHtml(prediction.dataQuality.label)} data</span>
    <span>${escapeHtml(prediction.confidence)} confidence</span>
    <span>${escapeHtml(prediction.dataQuality.freshness)} feed</span>
    <span>${escapeHtml(prediction.metadata.modelVersion)}</span>
    <span>${escapeHtml(prediction.marketEdges.recommended.label)}</span>
    <span>${escapeHtml(getStatusLabel(details.status))}</span>
  `;
}

function renderDetailScoreboard(details, scoreDisplay, prediction) {
  const homeProbability = formatPercent(prediction.probabilities.home);
  const awayProbability = formatPercent(prediction.probabilities.away);

  return `
    <div class="scoreboard-team">
      <span class="team-badge">${escapeHtml(details.homeTeam.shortName)}</span>
      <strong>${escapeHtml(details.homeTeam.name)}</strong>
      <small>${homeProbability}</small>
    </div>
    <div class="scoreboard-centre">
      <span>${escapeHtml(scoreDisplay.label)}</span>
      <strong>${escapeHtml(scoreDisplay.value)}</strong>
      <em>${escapeHtml(getStatusLabel(details.status))}</em>
    </div>
    <div class="scoreboard-team away">
      <span class="team-badge away">${escapeHtml(details.awayTeam.shortName)}</span>
      <strong>${escapeHtml(details.awayTeam.name)}</strong>
      <small>${awayProbability}</small>
    </div>
  `;
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

function renderModelBreakdown(breakdown) {
  return breakdown.rows.map(renderModelBreakdownRow).join("");
}

function renderModelBreakdownRow(row) {
  const width = row.direction === "neutral" ? Math.round(row.score * 100) : Math.max(4, Math.round(Math.abs(row.score) * 50));
  const meterStyle = `--bar-width:${clamp(width, 0, 100)}%`;
  const directionLabel =
    row.direction === "neutral" ? "Strength" : row.direction === "home" ? "Home edge" : row.direction === "away" ? "Away edge" : "Balanced";

  return `
    <article class="breakdown-row ${escapeHtml(row.direction)}">
      <div class="breakdown-copy">
        <span>${escapeHtml(row.label)}</span>
        <strong>${escapeHtml(row.lean)}</strong>
        <em>${escapeHtml(row.description)}</em>
      </div>
      <div class="breakdown-meter" aria-label="${escapeHtml(`${row.label}: ${directionLabel}`)}">
        <span style="${meterStyle}"></span>
      </div>
      <small>${escapeHtml(row.value)}</small>
    </article>
  `;
}

function renderRecommendationPanel(prediction) {
  const pick = prediction.marketEdges.recommended;
  const alternatives = prediction.marketEdges.alternatives
    .map((item) => `<span>${escapeHtml(item.label)} ${formatPercent(item.probability)}</span>`)
    .join("");

  return `
    <article class="recommendation-panel ${prediction.dataQuality.level}">
      <div class="recommendation-head">
        <div>
          <span>Safer angle</span>
          <strong>${escapeHtml(pick.label)}</strong>
        </div>
        <div class="quality-pill ${prediction.dataQuality.level}">${escapeHtml(prediction.dataQuality.label)} data</div>
      </div>
      <div class="recommendation-meta">
        <span>${escapeHtml(pick.market)}</span>
        <span>${formatPercent(pick.probability)} model probability</span>
        <span>${escapeHtml(pick.risk)}</span>
      </div>
      <p>${escapeHtml(pick.reason)} This is an analysis signal, not a guaranteed result.</p>
      <div class="insight-list">
        ${prediction.insights.map((insight) => `<span>${escapeHtml(insight)}</span>`).join("")}
      </div>
      ${alternatives ? `<div class="alternative-picks"><strong>Also watch</strong>${alternatives}</div>` : ""}
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

function renderProvenanceComparisonRows(homeTeam, awayTeam, rows = []) {
  if (!rows.length) {
    return `<div class="empty-state inline"><strong>No statistics available</strong><span>GoalIQ will show verified statistics when a licensed provider is connected.</span></div>`;
  }

  return `
    <div class="comparison-head">
      <span>Metric</span>
      <strong>${escapeHtml(homeTeam.shortName)}</strong>
      <strong>${escapeHtml(awayTeam.shortName)}</strong>
    </div>
    ${rows
      .map(
        (row) => `
          <div class="comparison-row provenance-row">
            <span>
              ${escapeHtml(row.label)}
              <small>${escapeHtml(getSharedProvenanceLabel(row.home, row.away))}</small>
            </span>
            ${renderProvenanceValue(row.home)}
            ${renderProvenanceValue(row.away)}
          </div>
        `
      )
      .join("")}
  `;
}

function renderProvenanceValue(stat) {
  const safeStat = stat && typeof stat === "object" ? stat : { display: "Unavailable", sourceType: "unavailable", label: "Unavailable" };
  const sourceType = safeStat.sourceType || "unavailable";
  return `
    <strong class="stat-value ${escapeHtml(sourceType)}">
      ${escapeHtml(safeStat.display ?? formatStat(safeStat.value))}
      <small>${escapeHtml(safeStat.label || getProvenanceLabel(safeStat))}</small>
    </strong>
  `;
}

function getSharedProvenanceLabel(homeStat, awayStat) {
  const labels = [homeStat, awayStat].map(getProvenanceLabel);
  return [...new Set(labels)].join(" / ");
}

function getProvenanceLabel(stat = {}) {
  if (stat.verified || stat.sourceType === "provider") return "Verified statistic";
  if (stat.sourceType === "model") return "Model estimate";
  if (stat.sourceType === "derived") return "Derived from verified scores";
  if (stat.sourceType === "demo") return "Demo snapshot";
  return "Unavailable";
}

function renderH2H(details, summary) {
  if (!details.h2h.length) {
    return `<div class="empty-state inline"><strong>No verified head-to-head data</strong><span>GoalIQ will show meetings when the fixture feed includes finished matches between these teams.</span></div>`;
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

  selectors.topPicksList.addEventListener("click", (event) => {
    const card = event.target.closest("[data-match-id]");
    if (!card) return;
    openMatchDetail(card.dataset.matchId);
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
  moveToUpcomingMatchday();
  if (updateUrl) {
    const nextUrl = view === "picks" ? "#top-picks" : `${window.location.pathname}${window.location.search}`;
    history.replaceState(null, "", nextUrl);
  }
  renderActiveView();
}

function getInitialViewFromLocation() {
  return window.location.hash === "#top-picks" ? "picks" : "today";
}

function init() {
  selectors.dateInput.value = state.selectedDate;
  state.activeView = getInitialViewFromLocation();
  bindEvents();
  document.querySelectorAll(".nav-tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.view === state.activeView));
  clearFixtureBoard(liveFeedLoadingMeta, {
    message: "Loading verified live fixture feed..."
  });
  loadLiveFixtureFeed({ persist: false, silent: true })
    .then((imported) => {
      setImportStatus(`Loaded ${imported.matches.length} verified fixtures from the live feed.`);
    })
    .catch((error) => {
      clearFixtureBoard(liveFeedUnavailableMeta, {
        message: `${error.message || "Could not load the live fixture feed."} Demo fixtures are hidden on the public board.`,
        isError: true
      });
    });
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator) || window.location.protocol === "file:") return;

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch((error) => {
      console.warn("GoalIQ service worker registration failed", error);
    });
  });
}

function renderFixtureSource() {
  const source = fixtureMeta.source || "Fixture feed";
  const updated = fixtureMeta.updatedAt ? `Updated ${fixtureMeta.updatedAt}` : "Update time unavailable";
  const note = fixtureMeta.note ? ` ${fixtureMeta.note}` : "";
  selectors.fixtureSourceText.textContent = `${source}. ${updated}.${note}`;
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

function cloneHistoricalMatch(match) {
  return {
    ...match,
    sourceQuality: match.sourceQuality ? { ...match.sourceQuality } : null
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
  if (match.status === "live") {
    const minute = Number(match.minute);
    return Number.isFinite(minute) && minute > 0 ? `${Math.round(minute)}'` : "Live";
  }
  if (match.status === "halftime") return "HT";
  if (match.status === "finished") return "FT";
  if (isInactiveStatus(match.status)) return getStatusLabel(match.status);
  return match.time || "TBD";
}

function getStatusLabel(status) {
  return (
    statusLabels[status] ||
    String(status || "upcoming")
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\b\w/g, (letter) => letter.toUpperCase())
  );
}

function isInactiveStatus(status) {
  return ["postponed", "suspended", "cancelled"].includes(status);
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
  if (!Number.isFinite(Number(value))) return "Unavailable";
  if (suffix === "%") return `${Math.round(value)}%`;
  return Number(value).toFixed(value >= 10 ? 1 : 2);
}

function formatTimestamp(value) {
  if (!value) return "Unavailable";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value);
  return parsed.toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function toFiniteOrNull(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
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
  getNextUpcomingMatchDate,
  getFinishedMatches,
  getMatchDetails,
  getTeamLastFiveMatches,
  calculatePrediction,
  importFixtureData,
  resetFixtureData,
  getFixtureDataExport,
  loadFixtureDataFromUrl,
  loadLiveFixtureFeed
};
window.FootballEdgeServices = window.GoalIQServices;

registerServiceWorker();
init();
