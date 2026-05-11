import { NextRequest, NextResponse } from "next/server";
import { supabase, calculatePoints, DbPrediction } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

export async function GET() {
  const { data, error } = await supabase.from("matches").select("*").order("match_number");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: "אין הרשאות" }, { status: 403 });

  try {
    const { matchId, homeScore, awayScore } = await req.json();
    if (matchId == null || homeScore == null || awayScore == null)
      return NextResponse.json({ error: "נתונים חסרים" }, { status: 400 });

    // Update match result
    const { error: matchErr } = await supabase
      .from("matches")
      .update({ home_score: homeScore, away_score: awayScore })
      .eq("id", matchId);

    if (matchErr) return NextResponse.json({ error: matchErr.message }, { status: 500 });

    // Recalculate points for all predictions on this match
    const { data: preds } = await supabase
      .from("predictions")
      .select("*")
      .eq("match_id", matchId) as { data: DbPrediction[] | null };

    if (preds?.length) {
      const updates = preds.map((p) => ({
        ...p,
        points: calculatePoints(p.home_score, p.away_score, homeScore, awayScore),
      }));
      await supabase.from("predictions").upsert(updates);
    }

    return NextResponse.json({ success: true, updatedPredictions: preds?.length ?? 0 });
  } catch {
    return NextResponse.json({ error: "שגיאת שרת" }, { status: 500 });
  }
}
