import { NextRequest, NextResponse } from "next/server";
import { supabase, calculatePoints, DbPrediction } from "@/lib/supabase";

const FD_BASE = "https://api.football-data.org/v4";
// Competitions to sync
const COMPETITIONS = ["WC", "PL", "SA"];

interface FdMatch {
  id: number;
  utcDate: string;
  status: string;
  homeTeam: { name: string };
  awayTeam: { name: string };
  score: { fullTime: { home: number | null; away: number | null } };
}

function teamMatch(ourName: string, apiName: string): boolean {
  const a = ourName.toLowerCase().trim();
  const b = apiName.toLowerCase().trim();
  return a === b || a.includes(b) || b.includes(a);
}

export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret") ?? req.nextUrl.searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch finished matches from all tracked competitions
    const allApiMatches: FdMatch[] = [];
    for (const comp of COMPETITIONS) {
      const res = await fetch(`${FD_BASE}/competitions/${comp}/matches?status=FINISHED`, {
        headers: { "X-Auth-Token": process.env.FOOTBALL_DATA_API_KEY! },
        cache: "no-store",
      });
      if (!res.ok) continue;
      const { matches } = await res.json() as { matches: FdMatch[] };
      if (matches?.length) allApiMatches.push(...matches);
    }

    if (!allApiMatches.length) {
      return NextResponse.json({ updated: 0, msg: "No finished matches from any competition" });
    }

    // Only fetch unscored matches from our DB
    const { data: ourMatches } = await supabase
      .from("matches")
      .select("id, match_date, home_team, away_team")
      .is("home_score", null);

    if (!ourMatches?.length) {
      return NextResponse.json({ updated: 0, msg: "All matches already scored" });
    }

    let updated = 0;

    for (const apiMatch of allApiMatches) {
      const ft = apiMatch.score?.fullTime;
      if (ft?.home == null || ft?.away == null) continue;

      // Match by team names (primary) — prefer same-day matches, fall back to team-only
      const apiDay = apiMatch.utcDate.slice(0, 10);
      const byTeams = (m: typeof ourMatches[0]) =>
        teamMatch(m.home_team, apiMatch.homeTeam.name) &&
        teamMatch(m.away_team, apiMatch.awayTeam.name);

      const ourMatch =
        ourMatches.find((m) => m.match_date?.slice(0, 10) === apiDay && byTeams(m)) ??
        ourMatches.find((m) => byTeams(m));

      if (!ourMatch) continue;

      const homeScore = ft.home;
      const awayScore = ft.away;

      const { error: matchErr } = await supabase
        .from("matches")
        .update({ home_score: homeScore, away_score: awayScore })
        .eq("id", ourMatch.id);

      if (matchErr) continue;

      const { data: preds } = (await supabase
        .from("predictions")
        .select("*")
        .eq("match_id", ourMatch.id)) as { data: DbPrediction[] | null };

      if (preds?.length) {
        const updates = preds.map((p) => ({
          ...p,
          points: calculatePoints(p.home_score, p.away_score, homeScore, awayScore),
        }));
        await supabase.from("predictions").upsert(updates);
      }

      updated++;
    }

    return NextResponse.json({
      ok: true,
      updated,
      total_finished: allApiMatches.length,
      ts: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
