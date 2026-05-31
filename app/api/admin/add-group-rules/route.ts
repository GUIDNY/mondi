import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { Client } from "pg";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-secret") ?? req.nextUrl.searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET) {
    const session = await getSession();
    if (!session?.isAdmin) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const client = new Client({ connectionString: process.env.SUPABASE_DB_URL });
  try {
    await client.connect();
    await client.query(`ALTER TABLE groups ADD COLUMN IF NOT EXISTS rules text`);
    await client.query(`ALTER TABLE groups ADD COLUMN IF NOT EXISTS prize_1st text`);
    await client.query(`ALTER TABLE groups ADD COLUMN IF NOT EXISTS prize_2nd text`);
    await client.query(`ALTER TABLE groups ADD COLUMN IF NOT EXISTS prize_3rd text`);
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  } finally {
    await client.end();
  }
}
