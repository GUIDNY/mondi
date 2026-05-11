import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";
import { signToken, COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { username, email, password } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json({ error: "כל השדות נדרשים" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "סיסמה חייבת להיות לפחות 6 תווים" }, { status: 400 });
    }

    const db = getDb();
    const existing = db.prepare("SELECT id FROM users WHERE email = ? OR username = ?").get(email, username);
    if (existing) {
      return NextResponse.json({ error: "משתמש עם שם או אימייל זה כבר קיים" }, { status: 409 });
    }

    const hash = await bcrypt.hash(password, 10);
    const userCount = (db.prepare("SELECT COUNT(*) as c FROM users").get() as { c: number }).c;
    const isAdmin = userCount === 0 ? 1 : 0;

    const result = db.prepare(
      "INSERT INTO users (username, email, password_hash, is_admin) VALUES (?, ?, ?, ?)"
    ).run(username, email, hash, isAdmin);

    const token = await signToken({
      userId: result.lastInsertRowid as number,
      username,
      isAdmin: isAdmin === 1,
    });

    const res = NextResponse.json({ success: true, isAdmin: isAdmin === 1 });
    res.cookies.set(COOKIE_NAME, token, { httpOnly: true, maxAge: 60 * 60 * 24 * 30, path: "/" });
    return res;
  } catch {
    return NextResponse.json({ error: "שגיאת שרת" }, { status: 500 });
  }
}
