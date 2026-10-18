-- Design only; no migration has been applied to any external database.
PRAGMA foreign_keys = ON;
CREATE TABLE runs (
  id TEXT PRIMARY KEY,
  token_hash TEXT NOT NULL UNIQUE,
  started_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  ruleset INTEGER NOT NULL,
  game_version TEXT NOT NULL,
  CHECK (expires_at > started_at)
);
CREATE TABLE scores (
  id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL UNIQUE REFERENCES runs(id),
  name TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 12),
  score INTEGER NOT NULL CHECK (typeof(score) = 'integer' AND score >= 0),
  elapsed_ms INTEGER NOT NULL CHECK (elapsed_ms >= 0),
  ruleset INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX scores_ranking ON scores(ruleset, score DESC, created_at ASC, id ASC);
