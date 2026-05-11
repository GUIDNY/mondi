import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { ALL_MATCHES } from "./matches-data";

const DB_PATH = path.join(process.cwd(), "data", "mondi.db");

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;

  const dataDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  _db = new Database(DB_PATH);
  _db.pragma("journal_mode = WAL");
  _db.pragma("foreign_keys = ON");
  initSchema(_db);
  return _db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      is_admin INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
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
      match_date TEXT,
      venue TEXT,
      home_score INTEGER,
      away_score INTEGER
    );

    CREATE TABLE IF NOT EXISTS predictions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      match_id INTEGER NOT NULL,
      home_score INTEGER NOT NULL,
      away_score INTEGER NOT NULL,
      points INTEGER,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, match_id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (match_id) REFERENCES matches(id)
    );
  `);

  const count = (db.prepare("SELECT COUNT(*) as c FROM matches").get() as { c: number }).c;
  if (count === 0) seedMatches(db);
}

function seedMatches(db: Database.Database) {
  const insert = db.prepare(`
    INSERT INTO matches (id, group_name, stage, match_number, home_team, home_flag, away_team, away_flag, match_date, venue)
    VALUES (@id, @groupName, @stage, @matchNumber, @homeTeam, @homeFlag, @awayTeam, @awayFlag, @matchDate, @venue)
  `);
  const insertMany = db.transaction(() => {
    for (const m of ALL_MATCHES) insert.run(m);
  });
  insertMany();
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface DbUser {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  is_admin: number;
  created_at: string;
}

export interface DbMatch {
  id: number;
  group_name: string | null;
  stage: string;
  match_number: number;
  home_team: string;
  home_flag: string;
  away_team: string;
  away_flag: string;
  match_date: string | null;
  venue: string | null;
  home_score: number | null;
  away_score: number | null;
}

export interface DbPrediction {
  id: number;
  user_id: number;
  match_id: number;
  home_score: number;
  away_score: number;
  points: number | null;
  created_at: string;
  updated_at: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function calculatePoints(
  predHome: number,
  predAway: number,
  actualHome: number,
  actualAway: number
): number {
  if (predHome === actualHome && predAway === actualAway) return 4;
  const predOutcome = Math.sign(predHome - predAway);
  const actualOutcome = Math.sign(actualHome - actualAway);
  if (predOutcome === actualOutcome) return 1;
  return 0;
}
