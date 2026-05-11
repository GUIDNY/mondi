import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const [{ data: users }, { data: preds }] = await Promise.all([
    supabase.from("users").select("id, username"),
    supabase.from("predictions").select("user_id, points"),
  ]);

  const leaderboard = (users || [])
    .map((u) => {
      const up = (preds || []).filter((p) => p.user_id === u.id);
      return {
        id: u.id,
        username: u.username,
        predictions_count: up.length,
        exact_count: up.filter((p) => p.points === 4).length,
        direction_count: up.filter((p) => p.points === 1).length,
        total_points: up.reduce((s, p) => s + (p.points || 0), 0),
      };
    })
    .sort((a, b) => b.total_points - a.total_points || b.exact_count - a.exact_count || b.predictions_count - a.predictions_count);

  return NextResponse.json(leaderboard);
}
