-- Additive and repeatable: all existing scored campaigns used the old Normal = new Hard.
CREATE TABLE IF NOT EXISTS arcade_score_modes (
 request_id TEXT PRIMARY KEY,
 difficulty TEXT NOT NULL CHECK(difficulty IN ('normal','hard'))
);
INSERT OR IGNORE INTO arcade_score_modes(request_id,difficulty)
 SELECT request_id,'hard' FROM arcade_scores;
CREATE TABLE IF NOT EXISTS arcade_run_modes (
 request_id TEXT PRIMARY KEY,
 difficulty TEXT NOT NULL CHECK(difficulty IN ('easy','normal','hard'))
);
INSERT OR IGNORE INTO arcade_run_modes(request_id,difficulty)
 SELECT request_id,CASE WHEN difficulty='normal' THEN 'hard' ELSE difficulty END FROM arcade_game_runs;
