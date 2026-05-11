import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabase } from "@/lib/supabase";
import { signToken, COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { username, email, password } = await req.json();
    if (!username || !email || !password)
      return NextResponse.json({ error: "כל השדות נדרשים" }, { status: 400 });
    if (password.length < 6)
      return NextResponse.json({ error: "סיסמה חייבת להיות לפחות 6 תווים" }, { status: 400 });

    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .or(`email.eq.${email},username.eq.${username}`)
      .maybeSingle();

    if (existing)
      return NextResponse.json({ error: "משתמש עם שם או אימייל זה כבר קיים" }, { status: 409 });

    const hash = await bcrypt.hash(password, 10);
    const { count } = await supabase.from("users").select("*", { count: "exact", head: true });
    const isAdmin = count === 0;

    const { data: user, error } = await supabase
      .from("users")
      .insert({ username, email, password_hash: hash, is_admin: isAdmin })
      .select()
      .single();

    if (error || !user)
      return NextResponse.json({ error: "שגיאה ביצירת משתמש" }, { status: 500 });

    const token = await signToken({ userId: user.id, username, isAdmin });
    const res = NextResponse.json({ success: true, isAdmin });
    res.cookies.set(COOKIE_NAME, token, { httpOnly: true, maxAge: 60 * 60 * 24 * 30, path: "/" });
    return res;
  } catch {
    return NextResponse.json({ error: "שגיאת שרת" }, { status: 500 });
  }
}
