-- Reset receipts make retries safe without preserving deleted player data.
CREATE TABLE IF NOT EXISTS arcade_statistics_resets (
 request_id TEXT PRIMARY KEY,
 reset_at INTEGER NOT NULL
);
