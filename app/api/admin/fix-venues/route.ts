import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-secret") ?? req.nextUrl.searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET) {
    const session = await getSession();
    if (!session?.isAdmin) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { data: matches } = await supabase.from("matches").select("id, venue");
  if (!matches) return NextResponse.json({ error: "no matches" }, { status: 500 });

  const replacements: Record<string, string> = {
    "World Cup 2026": "Football 2026",
    "Football Championship 2026": "Football 2026",
    "Premier League": "England",
    "Serie A": "Italy",
    "La Liga": "Spain",
  };

  let updated = 0;
  for (const m of matches) {
    if (!m.venue) continue;
    let newVenue = m.venue;
    for (const [from, to] of Object.entries(replacements)) {
      newVenue = newVenue.replace(from, to);
    }
    if (newVenue !== m.venue) {
      await supabase.from("matches").update({ venue: newVenue }).eq("id", m.id);
      updated++;
    }
  }

  return NextResponse.json({ ok: true, updated });
}
