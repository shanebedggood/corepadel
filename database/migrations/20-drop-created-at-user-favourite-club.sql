-- Migration: Drop created_at from core.user_favourite_club

BEGIN;

SET search_path TO core, public;

ALTER TABLE IF EXISTS core.user_favourite_club
  DROP COLUMN IF EXISTS created_at;

COMMIT;


