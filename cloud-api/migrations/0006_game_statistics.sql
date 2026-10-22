CREATE TABLE IF NOT EXISTS arcade_game_stats_state (
 singleton INTEGER PRIMARY KEY CHECK(singleton=1),
 since INTEGER NOT NULL,
 reset_id TEXT NOT NULL
);
INSERT OR IGNORE INTO arcade_game_stats_state VALUES(1,CAST(strftime('%s','now') AS INTEGER),'initial');
CREATE TABLE IF NOT EXISTS arcade_game_runs (
 request_id TEXT PRIMARY KEY,
 difficulty TEXT NOT NULL CHECK(difficulty IN ('normal','easy')),
 training INTEGER NOT NULL DEFAULT 0,
 killer_id TEXT,
 created_at INTEGER NOT NULL
);
