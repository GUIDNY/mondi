/**
 * Creates groups + group_members tables in Supabase.
 * Run: node scripts/setup-groups.mjs
 */
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://buykrqnshafbvnuwthwd.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1eWtycW5zaGFmYnZudXd0aHdkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODQ3NDE2MSwiZXhwIjoyMDk0MDUwMTYxfQ.gHZ099lFSoUjY9FxbK11PwUV1vxMICOdYMPsV2_9yPQ";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Use pg directly for DDL since Supabase JS client doesn't support raw SQL well
import pg from "pg";
const { Client } = pg;

const client = new Client({
  connectionString: "postgresql://postgres:Idan2507!123@db.buykrqnshafbvnuwthwd.supabase.co:5432/postgres",
});

await client.connect();

await client.query(`
  CREATE TABLE IF NOT EXISTS groups (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    creator_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scoring_exact INTEGER NOT NULL DEFAULT 4,
    scoring_direction INTEGER NOT NULL DEFAULT 1,
    has_champion_pick BOOLEAN NOT NULL DEFAULT false,
    has_top_scorer_pick BOOLEAN NOT NULL DEFAULT false,
    champion_bonus_pts INTEGER NOT NULL DEFAULT 5,
    top_scorer_bonus_pts INTEGER NOT NULL DEFAULT 3,
    champion_result TEXT,
    top_scorer_result TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );
`);
console.log("✓ groups table ready");

await client.query(`
  CREATE TABLE IF NOT EXISTS group_members (
    group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    champion_pick TEXT,
    top_scorer_pick TEXT,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (group_id, user_id)
  );
`);
console.log("✓ group_members table ready");

await client.end();
console.log("✅ Groups schema ready!");
