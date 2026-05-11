import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

// POST /api/groups/join — join a group by code
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { code } = await req.json();
  if (!code?.trim()) return NextResponse.json({ error: "קוד חסר" }, { status: 400 });

  const { data: group } = await supabase
    .from("groups")
    .select("id, name, code")
    .eq("code", code.trim().toUpperCase())
    .maybeSingle();

  if (!group) return NextResponse.json({ error: "קוד לא נמצא" }, { status: 404 });

  const { error } = await supabase
    .from("group_members")
    .insert({ group_id: group.id, user_id: session.userId });

  if (error?.code === "23505") {
    return NextResponse.json({ error: "כבר חבר בקבוצה זו" }, { status: 409 });
  }
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(group, { status: 200 });
}
