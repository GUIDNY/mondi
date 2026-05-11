import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { Client } from "pg";

export async function POST() {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const client = new Client({ connectionString: process.env.SUPABASE_DB_URL });
  try {
    await client.connect();
    await client.query(
      "ALTER TABLE matches ALTER COLUMN match_date TYPE timestamptz USING match_date::timestamptz"
    );
    await client.query(
      "UPDATE matches SET match_date = '2026-05-13T19:00:00Z' WHERE id = 106"
    );
    return NextResponse.json({ ok: true, message: "match_date column migrated to timestamptz" });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  } finally {
    await client.end();
  }
}
