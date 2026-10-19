-- Shared, opt-in arcade results. Dialogue tables are left untouched.
CREATE TABLE IF NOT EXISTS arcade_scores (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 request_id TEXT NOT NULL UNIQUE,
 name TEXT NOT NULL,
 score INTEGER NOT NULL CHECK(score BETWEEN 0 AND 100000),
 elapsed_ms INTEGER NOT NULL,
 created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS arcade_score_rank ON arcade_scores(score DESC,created_at,id);
