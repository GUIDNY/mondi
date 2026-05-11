import { NextRequest, NextResponse } from "next/server";
import { getDb, DbPrediction, calculatePoints } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: "אין הרשאות" }, { status: 403 });

  try {
    const { matchId, homeScore, awayScore } = await req.json();
    if (matchId == null || homeScore == null || awayScore == null) {
      return NextResponse.json({ error: "נתונים חסרים" }, { status: 400 });
    }

    const db = getDb();

    // Update match result
    db.prepare("UPDATE matches SET home_score = ?, away_score = ? WHERE id = ?").run(homeScore, awayScore, matchId);

    // Recalculate points for all predictions on this match
    const preds = db.prepare("SELECT * FROM predictions WHERE match_id = ?").all(matchId) as DbPrediction[];
    const updatePoints = db.prepare("UPDATE predictions SET points = ? WHERE id = ?");

    const update = db.transaction(() => {
      for (const p of preds) {
        const pts = calculatePoints(p.home_score, p.away_score, homeScore, awayScore);
        updatePoints.run(pts, p.id);
      }
    });
    update();

    return NextResponse.json({ success: true, updatedPredictions: preds.length });
  } catch {
    return NextResponse.json({ error: "שגיאת שרת" }, { status: 500 });
  }
}

export async function GET() {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: "אין הרשאות" }, { status: 403 });

  const db = getDb();
  const matches = db.prepare("SELECT * FROM matches ORDER BY match_number").all();
  return NextResponse.json(matches);
}
