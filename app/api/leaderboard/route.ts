import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const db = getDb();

  const rows = db.prepare(`
    SELECT
      u.id,
      u.username,
      COUNT(p.id) as predictions_count,
      COALESCE(SUM(CASE WHEN p.points = 4 THEN 1 ELSE 0 END), 0) as exact_count,
      COALESCE(SUM(CASE WHEN p.points = 1 THEN 1 ELSE 0 END), 0) as direction_count,
      COALESCE(SUM(p.points), 0) as total_points
    FROM users u
    LEFT JOIN predictions p ON p.user_id = u.id
    GROUP BY u.id
    ORDER BY total_points DESC, exact_count DESC, predictions_count DESC
  `).all();

  return NextResponse.json(rows);
}
