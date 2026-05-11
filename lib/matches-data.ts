export type Stage = "group" | "r32" | "r16" | "qf" | "sf" | "3rd" | "final";

export interface MatchData {
  id: number;
  groupName: string | null;
  stage: Stage;
  matchNumber: number;
  homeTeam: string;
  homeFlag: string;
  awayTeam: string;
  awayFlag: string;
  matchDate: string;
  venue: string;
}

const GROUPS: Record<string, { teams: string[]; flags: string[] }> = {
  A: { teams: ["Mexico", "South Africa", "South Korea", "Czechia"], flags: ["🇲🇽", "🇿🇦", "🇰🇷", "🇨🇿"] },
  B: { teams: ["Canada", "Bosnia & Herz.", "Qatar", "Switzerland"], flags: ["🇨🇦", "🇧🇦", "🇶🇦", "🇨🇭"] },
  C: { teams: ["Brazil", "Morocco", "Haiti", "Scotland"], flags: ["🇧🇷", "🇲🇦", "🇭🇹", "🏴󠁧󠁢󠁳󠁣󠁴󠁿"] },
  D: { teams: ["United States", "Paraguay", "Australia", "Türkiye"], flags: ["🇺🇸", "🇵🇾", "🇦🇺", "🇹🇷"] },
  E: { teams: ["Germany", "Curaçao", "Ivory Coast", "Ecuador"], flags: ["🇩🇪", "🇨🇼", "🇨🇮", "🇪🇨"] },
  F: { teams: ["Netherlands", "Japan", "Sweden", "Tunisia"], flags: ["🇳🇱", "🇯🇵", "🇸🇪", "🇹🇳"] },
  G: { teams: ["Belgium", "Egypt", "Iran", "New Zealand"], flags: ["🇧🇪", "🇪🇬", "🇮🇷", "🇳🇿"] },
  H: { teams: ["Spain", "Cape Verde", "Saudi Arabia", "Uruguay"], flags: ["🇪🇸", "🇨🇻", "🇸🇦", "🇺🇾"] },
  I: { teams: ["France", "Senegal", "Iraq", "Norway"], flags: ["🇫🇷", "🇸🇳", "🇮🇶", "🇳🇴"] },
  J: { teams: ["Argentina", "Algeria", "Austria", "Jordan"], flags: ["🇦🇷", "🇩🇿", "🇦🇹", "🇯🇴"] },
  K: { teams: ["Portugal", "Congo DR", "Uzbekistan", "Colombia"], flags: ["🇵🇹", "🇨🇩", "🇺🇿", "🇨🇴"] },
  L: { teams: ["England", "Croatia", "Ghana", "Panama"], flags: ["🏴󠁧󠁢󠁥󠁮󠁧󠁿", "🇭🇷", "🇬🇭", "🇵🇦"] },
};

// Matchday dates per group
const GROUP_DATES: Record<string, [string, string, string]> = {
  A: ["2026-06-11", "2026-06-17", "2026-06-23"],
  B: ["2026-06-11", "2026-06-17", "2026-06-23"],
  C: ["2026-06-12", "2026-06-18", "2026-06-24"],
  D: ["2026-06-12", "2026-06-18", "2026-06-24"],
  E: ["2026-06-13", "2026-06-19", "2026-06-25"],
  F: ["2026-06-13", "2026-06-19", "2026-06-25"],
  G: ["2026-06-14", "2026-06-20", "2026-06-26"],
  H: ["2026-06-14", "2026-06-20", "2026-06-26"],
  I: ["2026-06-15", "2026-06-21", "2026-06-26"],
  J: ["2026-06-15", "2026-06-21", "2026-06-26"],
  K: ["2026-06-16", "2026-06-22", "2026-06-27"],
  L: ["2026-06-16", "2026-06-22", "2026-06-27"],
};

const GROUP_VENUES: Record<string, string[]> = {
  A: ["Estadio Azteca, Mexico City", "SoFi Stadium, Los Angeles", "AT&T Stadium, Dallas"],
  B: ["BMO Field, Toronto", "Gillette Stadium, Boston", "Levi's Stadium, San Francisco"],
  C: ["MetLife Stadium, New York", "Hard Rock Stadium, Miami", "Estadio Akron, Guadalajara"],
  D: ["Lumen Field, Seattle", "Arrowhead Stadium, Kansas City", "Rose Bowl, Los Angeles"],
  E: ["Lincoln Financial Field, Philadelphia", "NRG Stadium, Houston", "Mercedes-Benz Stadium, Atlanta"],
  F: ["BC Place, Vancouver", "GEHA Field, Kansas City", "Estadio BBVA, Monterrey"],
  G: ["Q2 Stadium, Austin", "Camping World Stadium, Orlando", "Estadio Akron, Guadalajara"],
  H: ["SoFi Stadium, Los Angeles", "Allegiant Stadium, Las Vegas", "MetLife Stadium, New York"],
  I: ["Hard Rock Stadium, Miami", "Mercedes-Benz Stadium, Atlanta", "AT&T Stadium, Dallas"],
  J: ["Estadio Azteca, Mexico City", "NRG Stadium, Houston", "Rose Bowl, Los Angeles"],
  K: ["Estadio BBVA, Monterrey", "Levi's Stadium, San Francisco", "Lincoln Financial Field, Philadelphia"],
  L: ["BC Place, Vancouver", "BMO Field, Toronto", "Gillette Stadium, Boston"],
};

function generateGroupMatches(): MatchData[] {
  const result: MatchData[] = [];
  let id = 1;
  let matchNumber = 1;

  for (const groupName of Object.keys(GROUPS)) {
    const { teams, flags } = GROUPS[groupName];
    const dates = GROUP_DATES[groupName];
    const venues = GROUP_VENUES[groupName];

    // MD1: 1v2, 3v4
    result.push({ id: id++, groupName, stage: "group", matchNumber: matchNumber++, homeTeam: teams[0], homeFlag: flags[0], awayTeam: teams[1], awayFlag: flags[1], matchDate: dates[0], venue: venues[0] });
    result.push({ id: id++, groupName, stage: "group", matchNumber: matchNumber++, homeTeam: teams[2], homeFlag: flags[2], awayTeam: teams[3], awayFlag: flags[3], matchDate: dates[0], venue: venues[0] });
    // MD2: 1v3, 2v4
    result.push({ id: id++, groupName, stage: "group", matchNumber: matchNumber++, homeTeam: teams[0], homeFlag: flags[0], awayTeam: teams[2], awayFlag: flags[2], matchDate: dates[1], venue: venues[1] });
    result.push({ id: id++, groupName, stage: "group", matchNumber: matchNumber++, homeTeam: teams[1], homeFlag: flags[1], awayTeam: teams[3], awayFlag: flags[3], matchDate: dates[1], venue: venues[1] });
    // MD3: 1v4, 2v3
    result.push({ id: id++, groupName, stage: "group", matchNumber: matchNumber++, homeTeam: teams[0], homeFlag: flags[0], awayTeam: teams[3], awayFlag: flags[3], matchDate: dates[2], venue: venues[2] });
    result.push({ id: id++, groupName, stage: "group", matchNumber: matchNumber++, homeTeam: teams[1], homeFlag: flags[1], awayTeam: teams[2], awayFlag: flags[2], matchDate: dates[2], venue: venues[2] });
  }

  return result;
}

const KNOCKOUT_MATCHES: MatchData[] = [
  // Round of 32 (16 matches) - Jul 1-4
  ...Array.from({ length: 16 }, (_, i) => ({
    id: 73 + i,
    groupName: null,
    stage: "r32" as Stage,
    matchNumber: 73 + i,
    homeTeam: "TBD",
    homeFlag: "🏳️",
    awayTeam: "TBD",
    awayFlag: "🏳️",
    matchDate: i < 4 ? "2026-07-01" : i < 8 ? "2026-07-02" : i < 12 ? "2026-07-03" : "2026-07-04",
    venue: "TBD",
  })),
  // Round of 16 (8 matches) - Jul 5-8
  ...Array.from({ length: 8 }, (_, i) => ({
    id: 89 + i,
    groupName: null,
    stage: "r16" as Stage,
    matchNumber: 89 + i,
    homeTeam: "TBD",
    homeFlag: "🏳️",
    awayTeam: "TBD",
    awayFlag: "🏳️",
    matchDate: i < 2 ? "2026-07-05" : i < 4 ? "2026-07-06" : i < 6 ? "2026-07-07" : "2026-07-08",
    venue: "TBD",
  })),
  // Quarterfinals (4 matches) - Jul 9-10
  ...Array.from({ length: 4 }, (_, i) => ({
    id: 97 + i,
    groupName: null,
    stage: "qf" as Stage,
    matchNumber: 97 + i,
    homeTeam: "TBD",
    homeFlag: "🏳️",
    awayTeam: "TBD",
    awayFlag: "🏳️",
    matchDate: i < 2 ? "2026-07-09" : "2026-07-10",
    venue: "TBD",
  })),
  // Semifinals (2 matches) - Jul 14-15
  { id: 101, groupName: null, stage: "sf", matchNumber: 101, homeTeam: "TBD", homeFlag: "🏳️", awayTeam: "TBD", awayFlag: "🏳️", matchDate: "2026-07-14", venue: "TBD" },
  { id: 102, groupName: null, stage: "sf", matchNumber: 102, homeTeam: "TBD", homeFlag: "🏳️", awayTeam: "TBD", awayFlag: "🏳️", matchDate: "2026-07-15", venue: "TBD" },
  // 3rd place - Jul 18
  { id: 103, groupName: null, stage: "3rd", matchNumber: 103, homeTeam: "TBD", homeFlag: "🏳️", awayTeam: "TBD", awayFlag: "🏳️", matchDate: "2026-07-18", venue: "MetLife Stadium, New York" },
  // Final - Jul 19
  { id: 104, groupName: null, stage: "final", matchNumber: 104, homeTeam: "TBD", homeFlag: "🏳️", awayTeam: "TBD", awayFlag: "🏳️", matchDate: "2026-07-19", venue: "MetLife Stadium, New York" },
];

export const ALL_MATCHES: MatchData[] = [...generateGroupMatches(), ...KNOCKOUT_MATCHES];

export const STAGE_LABELS: Record<Stage, string> = {
  group: "שלב הבתים",
  r32: "שמינית גמר",
  r16: "שמינית גמר",
  qf: "רבע גמר",
  sf: "חצי גמר",
  "3rd": "מקום שלישי",
  final: "גמר",
};

export const STAGE_ORDER: Stage[] = ["group", "r32", "r16", "qf", "sf", "3rd", "final"];
