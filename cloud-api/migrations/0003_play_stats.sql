-- One anonymous browser/day, no raw IPs or device fingerprints.
CREATE TABLE IF NOT EXISTS arcade_plays (
 player_hash TEXT NOT NULL,
 play_day TEXT NOT NULL,
 PRIMARY KEY (player_hash,play_day)
);
CREATE INDEX IF NOT EXISTS arcade_play_day ON arcade_plays(play_day,player_hash);
