import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

// PUT /api/groups/[code]/settings — update group settings (creator only)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { code } = await params;
  const { data: group } = await supabase
    .from("groups")
    .select("id, creator_id")
    .eq("code", code.toUpperCase())
    .maybeSingle();

  if (!group) return NextResponse.json({ error: "קבוצה לא נמצאה" }, { status: 404 });
  if (group.creator_id !== session.userId) return NextResponse.json({ error: "רק יוצר הקבוצה יכול לערוך" }, { status: 403 });

  const body = await req.json();
  const allowed = ["name", "scoring_exact", "scoring_direction", "has_champion_pick", "has_top_scorer_pick", "champion_bonus_pts", "top_scorer_bonus_pts", "champion_result", "top_scorer_result"];
  const update: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) update[key] = body[key];
  }

  const { data, error } = await supabase
    .from("groups")
    .update(update)
    .eq("id", group.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// PUT /api/groups/[code]/settings — update MY picks (member)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { code } = await params;
  const { data: group } = await supabase
    .from("groups")
    .select("id, has_champion_pick, has_top_scorer_pick")
    .eq("code", code.toUpperCase())
    .maybeSingle();

  if (!group) return NextResponse.json({ error: "קבוצה לא נמצאה" }, { status: 404 });

  const { champion_pick, top_scorer_pick } = await req.json();
  const update: Record<string, string | null> = {};
  if (group.has_champion_pick && champion_pick !== undefined) update.champion_pick = champion_pick;
  if (group.has_top_scorer_pick && top_scorer_pick !== undefined) update.top_scorer_pick = top_scorer_pick;

  const { error } = await supabase
    .from("group_members")
    .update(update)
    .eq("group_id", group.id)
    .eq("user_id", session.userId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
