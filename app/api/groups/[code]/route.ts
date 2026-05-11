import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

// GET /api/groups/[code] — group detail + leaderboard
export async function GET(_req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { code } = await params;

  const { data: group } = await supabase
    .from("groups")
    .select("*")
    .eq("code", code.toUpperCase())
    .maybeSingle();

  if (!group) return NextResponse.json({ error: "קבוצה לא נמצאה" }, { status: 404 });

  // Check membership
  const { data: myMembership } = await supabase
    .from("group_members")
    .select("champion_pick, top_scorer_pick")
    .eq("group_id", group.id)
    .eq("user_id", session.userId)
    .maybeSingle();

  if (!myMembership) return NextResponse.json({ error: "אינך חבר בקבוצה זו" }, { status: 403 });

  // Get all members
  const { data: members } = await supabase
    .from("group_members")
    .select("user_id, champion_pick, top_scorer_pick, joined_at, users!user_id(username)")
    .eq("group_id", group.id);

  if (!members?.length) return NextResponse.json({ group, leaderboard: [], my_membership: myMembership });

  const userIds = members.map((m) => m.user_id);

  // Get all scored predictions for group members
  const { data: preds } = await supabase
    .from("predictions")
    .select("user_id, points")
    .in("user_id", userIds)
    .not("points", "is", null);

  // Build leaderboard with group's custom scoring
  const leaderboard = members.map((m) => {
    const userPreds = (preds || []).filter((p) => p.user_id === m.user_id);
    const exact_count = userPreds.filter((p) => p.points === 4).length;
    const direction_count = userPreds.filter((p) => p.points === 1).length;
    const match_points = exact_count * group.scoring_exact + direction_count * group.scoring_direction;

    let bonus_points = 0;
    if (group.has_champion_pick && group.champion_result && m.champion_pick === group.champion_result) {
      bonus_points += group.champion_bonus_pts;
    }
    if (group.has_top_scorer_pick && group.top_scorer_result && m.top_scorer_pick === group.top_scorer_result) {
      bonus_points += group.top_scorer_bonus_pts;
    }

    return {
      user_id: m.user_id,
      username: (m.users as unknown as { username: string } | null)?.username ?? "?",
      exact_count,
      direction_count,
      match_points,
      bonus_points,
      total_points: match_points + bonus_points,
      champion_pick: m.champion_pick,
      top_scorer_pick: m.top_scorer_pick,
      predictions_count: userPreds.length,
      is_me: m.user_id === session.userId,
    };
  }).sort((a, b) => b.total_points - a.total_points || b.exact_count - a.exact_count);

  return NextResponse.json({
    group,
    leaderboard,
    my_membership: myMembership,
    is_creator: group.creator_id === session.userId,
  });
}
