import { NextRequest, NextResponse } from "next/server";
import { supabase, calculatePoints, DbMatch } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "לא מחובר" }, { status: 401 });

  const { data, error } = await supabase
    .from("predictions")
    .select("*")
    .eq("user_id", session.userId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "לא מחובר" }, { status: 401 });

  try {
    const { matchId, homeScore, awayScore } = await req.json();
    if (matchId == null || homeScore == null || awayScore == null)
      return NextResponse.json({ error: "נתונים חסרים" }, { status: 400 });
    if (homeScore < 0 || awayScore < 0 || homeScore > 30 || awayScore > 30)
      return NextResponse.json({ error: "תוצאה לא תקינה" }, { status: 400 });

    const { data: match } = await supabase
      .from("matches")
      .select("*")
      .eq("id", matchId)
      .single() as { data: DbMatch | null };

    if (!match) return NextResponse.json({ error: "משחק לא נמצא" }, { status: 404 });
    if (match.home_team === "TBD") return NextResponse.json({ error: "הקבוצות טרם נקבעו" }, { status: 400 });
    if (match.home_score !== null) return NextResponse.json({ error: "המשחק כבר נגמר" }, { status: 400 });
    if (match.match_date && new Date(match.match_date) <= new Date())
      return NextResponse.json({ error: "המשחק כבר התחיל" }, { status: 400 });

    const points =
      match.home_score !== null && match.away_score !== null
        ? calculatePoints(homeScore, awayScore, match.home_score, match.away_score)
        : null;

    const { error } = await supabase.from("predictions").upsert(
      { user_id: session.userId, match_id: matchId, home_score: homeScore, away_score: awayScore, points, updated_at: new Date().toISOString() },
      { onConflict: "user_id,match_id" }
    );

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "שגיאת שרת" }, { status: 500 });
  }
}
