-- Separate additive table keeps existing results intact and migration repeatable.
CREATE TABLE IF NOT EXISTS arcade_score_avatars (
 request_id TEXT PRIMARY KEY REFERENCES arcade_scores(request_id),
 avatar_id TEXT NOT NULL
);
