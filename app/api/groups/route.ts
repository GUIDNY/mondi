import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

// GET /api/groups — list groups the current user belongs to
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: memberships } = await supabase
    .from("group_members")
    .select("group_id, champion_pick, top_scorer_pick, joined_at")
    .eq("user_id", session.userId);

  if (!memberships?.length) return NextResponse.json([]);

  const groupIds = memberships.map((m) => m.group_id);
  const { data: groups } = await supabase
    .from("groups")
    .select("*, users!creator_id(username)")
    .in("id", groupIds)
    .order("created_at", { ascending: false });

  const result = (groups || []).map((g) => ({
    ...g,
    creator_username: (g.users as { username: string } | null)?.username,
    users: undefined,
    my_champion_pick: memberships.find((m) => m.group_id === g.id)?.champion_pick,
    my_top_scorer_pick: memberships.find((m) => m.group_id === g.id)?.top_scorer_pick,
    is_creator: g.creator_id === session.userId,
  }));

  return NextResponse.json(result);
}

// POST /api/groups — create a new group
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, scoring_exact = 4, scoring_direction = 1, has_champion_pick = false, has_top_scorer_pick = false, champion_bonus_pts = 5, top_scorer_bonus_pts = 3 } = body;

  if (!name?.trim()) return NextResponse.json({ error: "שם הקבוצה חסר" }, { status: 400 });

  // Generate unique code
  let code = "";
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = generateCode();
    const { data } = await supabase.from("groups").select("id").eq("code", candidate).maybeSingle();
    if (!data) { code = candidate; break; }
  }
  if (!code) return NextResponse.json({ error: "שגיאה ביצירת קוד" }, { status: 500 });

  const { data: group, error } = await supabase
    .from("groups")
    .insert({
      name: name.trim(), code, creator_id: session.userId,
      scoring_exact, scoring_direction, has_champion_pick, has_top_scorer_pick,
      champion_bonus_pts, top_scorer_bonus_pts,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Creator auto-joins
  await supabase.from("group_members").insert({ group_id: group.id, user_id: session.userId });

  return NextResponse.json(group, { status: 201 });
}
