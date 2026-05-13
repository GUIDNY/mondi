-- Run this once in the Supabase SQL Editor
-- https://supabase.com/dashboard/project/buykrqnshafbvnuwthwd/sql/new

-- ─────────────────────────────────────────────────────────────────
-- TABLES
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS matches (
  id INTEGER PRIMARY KEY,
  group_name TEXT,
  stage TEXT NOT NULL,
  match_number INTEGER NOT NULL,
  home_team TEXT NOT NULL,
  home_flag TEXT NOT NULL,
  away_team TEXT NOT NULL,
  away_flag TEXT NOT NULL,
  match_date DATE,
  venue TEXT,
  home_score INTEGER,
  away_score INTEGER
);

CREATE TABLE IF NOT EXISTS predictions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  match_id INTEGER NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  home_score INTEGER NOT NULL,
  away_score INTEGER NOT NULL,
  points INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, match_id)
);

CREATE TABLE IF NOT EXISTS groups (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  creator_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scoring_exact INTEGER DEFAULT 4,
  scoring_direction INTEGER DEFAULT 1,
  has_champion_pick BOOLEAN DEFAULT FALSE,
  has_top_scorer_pick BOOLEAN DEFAULT FALSE,
  champion_bonus_pts INTEGER DEFAULT 5,
  top_scorer_bonus_pts INTEGER DEFAULT 3,
  champion_result TEXT,
  top_scorer_result TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS group_members (
  id SERIAL PRIMARY KEY,
  group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  champion_pick TEXT,
  top_scorer_pick TEXT,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- ─────────────────────────────────────────────────────────────────
-- GRANTS — Required before October 30, 2026 (Supabase policy change)
-- The app uses service_role for all DB access (server-side API routes),
-- so these grants are pre-emptive for the policy enforcement deadline.
-- ─────────────────────────────────────────────────────────────────

-- service_role: full access (used by all Next.js API routes)
grant all on public.users         to service_role;
grant all on public.matches       to service_role;
grant all on public.predictions   to service_role;
grant all on public.groups        to service_role;
grant all on public.group_members to service_role;
grant usage, select on all sequences in schema public to service_role;

-- anon: read-only on public data only (no user data)
grant select on public.matches to anon;

-- authenticated: not currently used (auth is custom JWT, not Supabase Auth)
-- Add grants here if Supabase Auth is adopted in future
