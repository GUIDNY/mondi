import { NextRequest, NextResponse } from "next/server";
import { supabase, calculatePoints, DbPrediction } from "@/lib/supabase";

const FD_BASE = "https://api.football-data.org/v4";
const COMPETITIONS = ["WC", "PL", "SA"];
const COMP_NAMES: Record<string, string> = { WC: "World Cup 2026", PL: "Premier League", SA: "Serie A" };

// Statuses where scores are live (match in progress)
const LIVE_STATUSES = new Set(["IN_PLAY", "PAUSED", "EXTRA_TIME", "PENALTY_SHOOTOUT"]);

interface FdMatch {
  id: number;
  utcDate: string;
  status: string;
  homeTeam: { name: string };
  awayTeam: { name: string };
  score: {
    fullTime: { home: number | null; away: number | null };
    halfTime?: { home: number | null; away: number | null };
    regularTime?: { home: number | null; away: number | null };
  };
}

function teamMatch(ourName: string, apiName: string): boolean {
  const a = ourName.toLowerCase().trim();
  const b = apiName.toLowerCase().trim();
  return a === b || a.includes(b) || b.includes(a);
}

function findOurMatch(
  apiMatch: FdMatch,
  pool: { id: number; match_date: string | null; home_team: string; away_team: string; venue?: string | null; home_score?: number | null }[]
) {
  const apiDay = apiMatch.utcDate.slice(0, 10);
  const byTeams = (m: typeof pool[0]) =>
    teamMatch(m.home_team, apiMatch.homeTeam.name) &&
    teamMatch(m.away_team, apiMatch.awayTeam.name);

  return (
    pool.find((m) => m.match_date?.slice(0, 10) === apiDay && byTeams(m)) ??
    pool.find((m) => byTeams(m))
  );
}

export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret") ?? req.nextUrl.searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const liveApiMatches: FdMatch[] = [];
    const finishedApiMatches: FdMatch[] = [];

    // Fetch LIVE + FINISHED matches for each competition
    for (const comp of COMPETITIONS) {
      const [liveRes, finRes] = await Promise.all([
        fetch(`${FD_BASE}/competitions/${comp}/matches?status=LIVE`, {
          headers: { "X-Auth-Token": process.env.FOOTBALL_DATA_API_KEY! },
          cache: "no-store",
        }),
        fetch(`${FD_BASE}/competitions/${comp}/matches?status=FINISHED`, {
          headers: { "X-Auth-Token": process.env.FOOTBALL_DATA_API_KEY! },
          cache: "no-store",
        }),
      ]);

      if (liveRes.ok) {
        const { matches } = await liveRes.json() as { matches: FdMatch[] };
        if (matches?.length) liveApiMatches.push(...matches);
      }
      if (finRes.ok) {
        const { matches } = await finRes.json() as { matches: FdMatch[] };
        if (matches?.length) finishedApiMatches.push(...matches);
      }
    }

    // Fetch all our matches
    const { data: allOurMatches } = await supabase
      .from("matches")
      .select("id, match_date, home_team, away_team, home_score, venue");

    const pool = allOurMatches ?? [];
    const unscoredPool = pool.filter(m => m.home_score === null);

    let liveUpdated = 0;
    let finishedUpdated = 0;

    // 1. Update live scores (in-progress matches) — no points calculation yet
    for (const apiMatch of liveApiMatches) {
      if (!LIVE_STATUSES.has(apiMatch.status)) continue;

      // Use the current score during the match (fullTime shows current, halfTime shows half-time)
      const currentScore = apiMatch.score?.fullTime ?? apiMatch.score?.halfTime;
      if (currentScore?.home == null || currentScore?.away == null) continue;

      const ourMatch = findOurMatch(apiMatch, pool);
      if (!ourMatch) continue;

      await supabase
        .from("matches")
        .update({ home_score: currentScore.home, away_score: currentScore.away })
        .eq("id", ourMatch.id);

      liveUpdated++;
    }

    // 2. Finalize finished matches — update score + calculate points
    for (const apiMatch of finishedApiMatches) {
      if (apiMatch.status !== "FINISHED") continue;

      const ft = apiMatch.score?.fullTime;
      if (ft?.home == null || ft?.away == null) continue;

      const ourMatch = findOurMatch(apiMatch, unscoredPool);
      if (!ourMatch) continue;

      const { error: matchErr } = await supabase
        .from("matches")
        .update({ home_score: ft.home, away_score: ft.away })
        .eq("id", ourMatch.id);

      if (matchErr) continue;

      const { data: preds } = (await supabase
        .from("predictions")
        .select("*")
        .eq("match_id", ourMatch.id)) as { data: DbPrediction[] | null };

      if (preds?.length) {
        const updates = preds.map((p) => ({
          ...p,
          points: calculatePoints(p.home_score, p.away_score, ft.home!, ft.away!),
        }));
        await supabase.from("predictions").upsert(updates);
      }

      finishedUpdated++;
    }

    // 3. Sync kickoff times for upcoming (TIMED/SCHEDULED) matches
    //    Stored in venue as "Competition Name||ISO_UTC_TIME"
    let timeSynced = 0;
    const debugSync: string[] = [];
    for (const comp of COMPETITIONS) {
      const timedRes = await fetch(`${FD_BASE}/competitions/${comp}/matches?status=SCHEDULED`, {
        headers: { "X-Auth-Token": process.env.FOOTBALL_DATA_API_KEY! },
        cache: "no-store",
      });
      if (!timedRes.ok) { debugSync.push(`${comp}:api_err_${timedRes.status}`); continue; }
      const body = await timedRes.json();
      const timedMatches: FdMatch[] = body.matches ?? [];
      debugSync.push(`${comp}:api=${timedMatches.length},pool=${unscoredPool.length}`);
      if (!timedMatches.length) continue;

      for (const apiMatch of timedMatches) {
        const ourMatch = findOurMatch(apiMatch, unscoredPool);
        if (!ourMatch) continue;
        const newVenue = `${COMP_NAMES[comp] ?? comp}||${apiMatch.utcDate}`;
        if (ourMatch.venue === newVenue) continue;
        const { error } = await supabase.from("matches").update({ venue: newVenue }).eq("id", ourMatch.id);
        if (!error) timeSynced++;
      }
    }

    return NextResponse.json({
      ok: true,
      live_updated: liveUpdated,
      finished_updated: finishedUpdated,
      time_synced: timeSynced,
      debug_sync: debugSync,
      ts: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
