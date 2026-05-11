/**
 * Setup script: seeds all 104 World Cup 2026 matches into Supabase.
 * Run: node scripts/setup-db.mjs
 */
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://buykrqnshafbvnuwthwd.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1eWtycW5zaGFmYnZudXd0aHdkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODQ3NDE2MSwiZXhwIjoyMDk0MDUwMTYxfQ.gHZ099lFSoUjY9FxbK11PwUV1vxMICOdYMPsV2_9yPQ";

const GROUPS = {
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

const GROUP_DATES = {
  A: ["2026-06-11", "2026-06-17", "2026-06-23"], B: ["2026-06-11", "2026-06-17", "2026-06-23"],
  C: ["2026-06-12", "2026-06-18", "2026-06-24"], D: ["2026-06-12", "2026-06-18", "2026-06-24"],
  E: ["2026-06-13", "2026-06-19", "2026-06-25"], F: ["2026-06-13", "2026-06-19", "2026-06-25"],
  G: ["2026-06-14", "2026-06-20", "2026-06-26"], H: ["2026-06-14", "2026-06-20", "2026-06-26"],
  I: ["2026-06-15", "2026-06-21", "2026-06-26"], J: ["2026-06-15", "2026-06-21", "2026-06-26"],
  K: ["2026-06-16", "2026-06-22", "2026-06-27"], L: ["2026-06-16", "2026-06-22", "2026-06-27"],
};

function generateMatches() {
  const matches = [];
  let id = 1, num = 1;
  for (const [g, { teams: t, flags: f }] of Object.entries(GROUPS)) {
    const d = GROUP_DATES[g];
    matches.push({ id: id++, group_name: g, stage: "group", match_number: num++, home_team: t[0], home_flag: f[0], away_team: t[1], away_flag: f[1], match_date: d[0], venue: "TBD" });
    matches.push({ id: id++, group_name: g, stage: "group", match_number: num++, home_team: t[2], home_flag: f[2], away_team: t[3], away_flag: f[3], match_date: d[0], venue: "TBD" });
    matches.push({ id: id++, group_name: g, stage: "group", match_number: num++, home_team: t[0], home_flag: f[0], away_team: t[2], away_flag: f[2], match_date: d[1], venue: "TBD" });
    matches.push({ id: id++, group_name: g, stage: "group", match_number: num++, home_team: t[1], home_flag: f[1], away_team: t[3], away_flag: f[3], match_date: d[1], venue: "TBD" });
    matches.push({ id: id++, group_name: g, stage: "group", match_number: num++, home_team: t[0], home_flag: f[0], away_team: t[3], away_flag: f[3], match_date: d[2], venue: "TBD" });
    matches.push({ id: id++, group_name: g, stage: "group", match_number: num++, home_team: t[1], home_flag: f[1], away_team: t[2], away_flag: f[2], match_date: d[2], venue: "TBD" });
  }
  for (let i = 0; i < 16; i++) matches.push({ id: id++, group_name: null, stage: "r32", match_number: num++, home_team: "TBD", home_flag: "🏳️", away_team: "TBD", away_flag: "🏳️", match_date: i < 4 ? "2026-07-01" : i < 8 ? "2026-07-02" : i < 12 ? "2026-07-03" : "2026-07-04", venue: "TBD" });
  for (let i = 0; i < 8; i++) matches.push({ id: id++, group_name: null, stage: "r16", match_number: num++, home_team: "TBD", home_flag: "🏳️", away_team: "TBD", away_flag: "🏳️", match_date: i < 2 ? "2026-07-05" : i < 4 ? "2026-07-06" : i < 6 ? "2026-07-07" : "2026-07-08", venue: "TBD" });
  for (let i = 0; i < 4; i++) matches.push({ id: id++, group_name: null, stage: "qf", match_number: num++, home_team: "TBD", home_flag: "🏳️", away_team: "TBD", away_flag: "🏳️", match_date: i < 2 ? "2026-07-09" : "2026-07-10", venue: "TBD" });
  matches.push({ id: id++, group_name: null, stage: "sf", match_number: num++, home_team: "TBD", home_flag: "🏳️", away_team: "TBD", away_flag: "🏳️", match_date: "2026-07-14", venue: "TBD" });
  matches.push({ id: id++, group_name: null, stage: "sf", match_number: num++, home_team: "TBD", home_flag: "🏳️", away_team: "TBD", away_flag: "🏳️", match_date: "2026-07-15", venue: "TBD" });
  matches.push({ id: id++, group_name: null, stage: "3rd", match_number: num++, home_team: "TBD", home_flag: "🏳️", away_team: "TBD", away_flag: "🏳️", match_date: "2026-07-18", venue: "MetLife Stadium, New York" });
  matches.push({ id: id++, group_name: null, stage: "final", match_number: num++, home_team: "TBD", home_flag: "🏳️", away_team: "TBD", away_flag: "🏳️", match_date: "2026-07-19", venue: "MetLife Stadium, New York" });
  return matches;
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });

const { count } = await supabase.from("matches").select("*", { count: "exact", head: true });
if (count && count > 0) { console.log(`✓ Already seeded (${count} matches). Done.`); process.exit(0); }

const matches = generateMatches();
const { error } = await supabase.from("matches").insert(matches);
if (error) { console.error("❌ Error:", error.message); process.exit(1); }
console.log(`✅ Seeded ${matches.length} matches into Supabase!`);
