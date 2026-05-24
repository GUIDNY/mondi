import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: "אין הרשאות" }, { status: 403 });

  const { data: users, error } = await supabase
    .from("users")
    .select("id, username, email, is_admin, created_at")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Aggregate predictions per user
  const { data: predStats } = await supabase
    .from("predictions")
    .select("user_id, points");

  const statsByUser: Record<number, { count: number; points: number }> = {};
  for (const p of predStats ?? []) {
    if (!statsByUser[p.user_id]) statsByUser[p.user_id] = { count: 0, points: 0 };
    statsByUser[p.user_id].count++;
    if (p.points !== null) statsByUser[p.user_id].points += p.points;
  }

  const result = (users ?? []).map((u) => ({
    ...u,
    predictions_count: statsByUser[u.id]?.count ?? 0,
    total_points: statsByUser[u.id]?.points ?? 0,
  }));

  return NextResponse.json(result);
}
