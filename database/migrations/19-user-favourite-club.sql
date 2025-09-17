-- Migration: Create user_favourite_club table

BEGIN;

SET search_path TO core, public;

CREATE TABLE IF NOT EXISTS core.user_favourite_club (
    firebase_uid VARCHAR(255) NOT NULL REFERENCES core."user"(firebase_uid) ON DELETE CASCADE,
    club_id UUID NOT NULL REFERENCES core.club(club_id) ON DELETE CASCADE,
    PRIMARY KEY (firebase_uid, club_id)
);

CREATE INDEX IF NOT EXISTS idx_user_fav_club_uid ON core.user_favourite_club(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_user_fav_club_club ON core.user_favourite_club(club_id);

COMMIT;


