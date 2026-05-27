import { NextRequest, NextResponse } from "next/server";
import { supabase, calculatePoints, DbPrediction } from "@/lib/supabase";

const FD_BASE = "https://api.football-data.org/v4";
const COMPETITIONS = ["WC", "PL", "SA", "PD"];
const COMP_NAMES: Record<string, string> = { WC: "Football Championship 2026", PL: "Premier League", SA: "Serie A", PD: "La Liga" };

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

function norm(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

// Stop-words to ignore when comparing by significant words
const STOP = new Set(["fc", "cf", "rc", "ac", "sc", "cd", "sd", "rcd", "ca", "ud", "de", "del", "el", "la", "los", "las"]);

function teamMatch(ourName: string | null, apiName: string | null): boolean {
  if (!ourName || !apiName) return false;
  const a = norm(ourName);
  const b = norm(apiName);
  if (a === b || a.includes(b) || b.includes(a)) return true;
  // Word-intersection fallback: covers cases like "Celta Vigo" vs "RC Celta de Vigo"
  const words = (s: string) => s.split(/\s+/).filter(w => w.length > 2 && !STOP.has(w));
  const aw = words(a);
  const bw = words(b);
  if (!aw.length || !bw.length) return false;
  const shared = aw.filter(w => bw.includes(w));
  return shared.length >= Math.min(aw.length, bw.length);
}

function findOurMatch(
  apiMatch: FdMatch,
  pool: { id: number; match_date: string | null; home_team: string; away_team: string; venue?: string | null; home_score?: number | null }[]
) {
  if (!apiMatch.homeTeam?.name || !apiMatch.awayTeam?.name) return undefined;
  const apiDay = apiMatch.utcDate.slice(0, 10);
  const byTeams = (m: typeof pool[0]) =>
    teamMatch(m.home_team, apiMatch.homeTeam.name) &&
    teamMatch(m.away_team, apiMatch.awayTeam.name);

  // Only match by date+teams. No date-free fallback — teams can play each other multiple
  // times per season, so matching by teams alone would corrupt future match slots with
  // historical results from earlier rounds.
  return pool.find((m) => {
    const matchDay = m.match_date?.slice(0, 10);
    if (!matchDay) return false;
    // Allow ±1 day tolerance (UTC date boundary edge cases)
    const apiTs = new Date(apiDay).getTime();
    const matchTs = new Date(matchDay).getTime();
    return Math.abs(apiTs - matchTs) <= 86_400_000 && byTeams(m);
  });
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
        fetch(`${FD_BASE}/competitions/${comp}/matches?status=FINISHED&dateFrom=${new Date(Date.now() - 14 * 86_400_000).toISOString().slice(0, 10)}`, {
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
    //    Use full pool (not unscoredPool) so live-updated matches also get points scored
    for (const apiMatch of finishedApiMatches) {
      if (apiMatch.status !== "FINISHED") continue;

      const ft = apiMatch.score?.fullTime;
      if (ft?.home == null || ft?.away == null) continue;

      const ourMatch = findOurMatch(apiMatch, pool);
      if (!ourMatch) continue;

      const { error: matchErr } = await supabase
        .from("matches")
        .update({ home_score: ft.home, away_score: ft.away })
        .eq("id", ourMatch.id);

      if (matchErr) continue;

      // Score predictions that haven't been scored yet — use UPDATE by id (reliable)
      const { data: preds } = (await supabase
        .from("predictions")
        .select("id, home_score, away_score")
        .eq("match_id", ourMatch.id)
        .is("points", null)) as { data: Pick<DbPrediction, "id" | "home_score" | "away_score">[] | null };

      if (preds?.length) {
        for (const p of preds) {
          const pts = calculatePoints(p.home_score, p.away_score, ft.home!, ft.away!);
          await supabase
            .from("predictions")
            .update({ points: pts, updated_at: new Date().toISOString() })
            .eq("id", p.id);
        }
      }

      finishedUpdated++;
    }

    // 3. Sync kickoff times for upcoming (TIMED/SCHEDULED) matches
    //    Stored in venue as "Competition Name||ISO_UTC_TIME"
    let timeSynced = 0;
    for (const comp of COMPETITIONS) {
      const timedRes = await fetch(`${FD_BASE}/competitions/${comp}/matches?status=SCHEDULED`, {
        headers: { "X-Auth-Token": process.env.FOOTBALL_DATA_API_KEY! },
        cache: "no-store",
      });
      if (!timedRes.ok) continue;
      const body = await timedRes.json();
      const timedMatches: FdMatch[] = body.matches ?? [];
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

    // 4. Self-heal: find ANY prediction with null points where the match already has a score.
    //    Catches anything the main loop missed, regardless of cause.
    const { data: unscoredPreds } = await supabase
      .from("predictions")
      .select("id, match_id, home_score, away_score")
      .is("points", null);

    let healed = 0;
    if (unscoredPreds?.length) {
      const matchIds = [...new Set(unscoredPreds.map(p => p.match_id))];
      const { data: scoredMatches } = await supabase
        .from("matches")
        .select("id, home_score, away_score")
        .in("id", matchIds)
        .not("home_score", "is", null);

      const matchMap = new Map((scoredMatches ?? []).map(m => [m.id, m]));
      for (const p of unscoredPreds) {
        const m = matchMap.get(p.match_id);
        if (!m || m.home_score == null || m.away_score == null) continue;
        const pts = calculatePoints(p.home_score, p.away_score, m.home_score, m.away_score);
        await supabase
          .from("predictions")
          .update({ points: pts, updated_at: new Date().toISOString() })
          .eq("id", p.id);
        healed++;
      }
    }

    return NextResponse.json({
      ok: true,
      live_updated: liveUpdated,
      finished_updated: finishedUpdated,
      time_synced: timeSynced,
      healed,
      ts: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
