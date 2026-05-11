import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb, DbUser } from "@/lib/db";
import { signToken, COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "כל השדות נדרשים" }, { status: 400 });
    }

    const db = getDb();
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as DbUser | undefined;
    if (!user) {
      return NextResponse.json({ error: "אימייל או סיסמה שגויים" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: "אימייל או סיסמה שגויים" }, { status: 401 });
    }

    const token = await signToken({ userId: user.id, username: user.username, isAdmin: user.is_admin === 1 });
    const res = NextResponse.json({ success: true, isAdmin: user.is_admin === 1 });
    res.cookies.set(COOKIE_NAME, token, { httpOnly: true, maxAge: 60 * 60 * 24 * 30, path: "/" });
    return res;
  } catch {
    return NextResponse.json({ error: "שגיאת שרת" }, { status: 500 });
  }
}
