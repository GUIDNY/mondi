import { NextResponse } from "next/server";
import { getSession, COOKIE_NAME } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function DELETE() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "לא מחובר" }, { status: 401 });

  const userId = session.userId;

  // Delete user's data in order (predictions first, then the user)
  await supabase.from("predictions").delete().eq("user_id", userId);
  await supabase.from("group_members").delete().eq("user_id", userId);
  await supabase.from("users").delete().eq("id", userId);

  const res = NextResponse.json({ success: true });
  res.cookies.set(COOKIE_NAME, "", { maxAge: 0, path: "/" });
  return res;
}
