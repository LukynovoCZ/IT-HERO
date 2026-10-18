-- Additive migration: safe alongside future runs/scores tables in the same D1 DB.
CREATE TABLE IF NOT EXISTS dialogue_suggestions (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 request_id TEXT NOT NULL UNIQUE,
 character_id TEXT NOT NULL,
 group_id TEXT NOT NULL,
 lines_json TEXT NOT NULL,
 author TEXT NOT NULL DEFAULT '',
 status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','accepted','rejected')),
 created_at INTEGER NOT NULL,
 updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS dialogue_status_created ON dialogue_suggestions(status,id DESC);
CREATE TABLE IF NOT EXISTS dialogue_rate_limits (
 bucket TEXT PRIMARY KEY,
 count INTEGER NOT NULL DEFAULT 0,
 expires_at INTEGER NOT NULL
);
