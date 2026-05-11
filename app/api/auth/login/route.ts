import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabase, DbUser } from "@/lib/supabase";
import { signToken, COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password)
      return NextResponse.json({ error: "כל השדות נדרשים" }, { status: 400 });

    const { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .maybeSingle() as { data: DbUser | null };

    if (!user)
      return NextResponse.json({ error: "אימייל או סיסמה שגויים" }, { status: 401 });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid)
      return NextResponse.json({ error: "אימייל או סיסמה שגויים" }, { status: 401 });

    const token = await signToken({ userId: user.id, username: user.username, isAdmin: user.is_admin });
    const res = NextResponse.json({ success: true, isAdmin: user.is_admin });
    res.cookies.set(COOKIE_NAME, token, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 30, path: "/" });
    return res;
  } catch {
    return NextResponse.json({ error: "שגיאת שרת" }, { status: 500 });
  }
}
