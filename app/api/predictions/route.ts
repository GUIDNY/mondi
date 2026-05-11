import { NextRequest, NextResponse } from "next/server";
import { getDb, DbMatch, calculatePoints } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "לא מחובר" }, { status: 401 });

  const db = getDb();
  const preds = db.prepare("SELECT * FROM predictions WHERE user_id = ?").all(session.userId);
  return NextResponse.json(preds);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "לא מחובר" }, { status: 401 });

  try {
    const { matchId, homeScore, awayScore } = await req.json();
    if (matchId == null || homeScore == null || awayScore == null) {
      return NextResponse.json({ error: "נתונים חסרים" }, { status: 400 });
    }
    if (homeScore < 0 || awayScore < 0 || homeScore > 30 || awayScore > 30) {
      return NextResponse.json({ error: "תוצאה לא תקינה" }, { status: 400 });
    }

    const db = getDb();
    const match = db.prepare("SELECT * FROM matches WHERE id = ?").get(matchId) as DbMatch | undefined;
    if (!match) return NextResponse.json({ error: "משחק לא נמצא" }, { status: 404 });
    if (match.home_team === "TBD") return NextResponse.json({ error: "הקבוצות טרם נקבעו" }, { status: 400 });

    // Block if match already started or result entered
    if (match.home_score !== null) {
      return NextResponse.json({ error: "המשחק כבר נגמר" }, { status: 400 });
    }
    if (match.match_date && new Date(match.match_date) <= new Date()) {
      return NextResponse.json({ error: "המשחק כבר התחיל" }, { status: 400 });
    }

    // Calculate points if result already exists
    let points: number | null = null;
    if (match.home_score !== null && match.away_score !== null) {
      points = calculatePoints(homeScore, awayScore, match.home_score, match.away_score);
    }

    db.prepare(`
      INSERT INTO predictions (user_id, match_id, home_score, away_score, points)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(user_id, match_id) DO UPDATE SET
        home_score = excluded.home_score,
        away_score = excluded.away_score,
        points = excluded.points,
        updated_at = datetime('now')
    `).run(session.userId, matchId, homeScore, awayScore, points);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "שגיאת שרת" }, { status: 500 });
  }
}
