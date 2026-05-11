import { NextRequest, NextResponse } from "next/server";
import { supabase, calculatePoints, DbPrediction } from "@/lib/supabase";

const FD_BASE = "https://api.football-data.org/v4";

export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret") ?? req.nextUrl.searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch all finished WC matches from football-data.org
    const apiRes = await fetch(`${FD_BASE}/competitions/WC/matches?status=FINISHED`, {
      headers: { "X-Auth-Token": process.env.FOOTBALL_DATA_API_KEY! },
      cache: "no-store",
    });

    if (!apiRes.ok) {
      const body = await apiRes.text();
      return NextResponse.json({ error: `football-data.org: ${apiRes.status}`, detail: body }, { status: 502 });
    }

    const { matches: apiMatches } = await apiRes.json() as { matches: FdMatch[] };
    if (!apiMatches?.length) {
      return NextResponse.json({ updated: 0, msg: "No finished matches yet" });
    }

    // Only fetch matches not yet scored in our DB
    const { data: ourMatches } = await supabase
      .from("matches")
      .select("id, match_date, home_team, away_team")
      .is("home_score", null);

    if (!ourMatches?.length) {
      return NextResponse.json({ updated: 0, msg: "All matches already scored" });
    }

    let updated = 0;

    for (const apiMatch of apiMatches) {
      const ft = apiMatch.score?.fullTime;
      if (ft?.home == null || ft?.away == null) continue;

      // Match by UTC date within a 3-hour window (each WC slot is unique)
      const apiTime = new Date(apiMatch.utcDate).getTime();
      const ourMatch = ourMatches.find((m) => {
        if (!m.match_date) return false;
        return Math.abs(new Date(m.match_date).getTime() - apiTime) < 3 * 60 * 60 * 1000;
      });

      if (!ourMatch) continue;

      const homeScore = ft.home;
      const awayScore = ft.away;

      // Update match result
      const { error: matchErr } = await supabase
        .from("matches")
        .update({ home_score: homeScore, away_score: awayScore })
        .eq("id", ourMatch.id);

      if (matchErr) continue;

      // Recalculate all predictions for this match
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
      total_finished: apiMatches.length,
      ts: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

interface FdMatch {
  id: number;
  utcDate: string;
  status: string;
  homeTeam: { name: string; shortName: string };
  awayTeam: { name: string; shortName: string };
  score: {
    fullTime: { home: number | null; away: number | null };
  };
}
