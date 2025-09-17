-- Migration: Add team_number column to core.court_bookings to match Java entity
-- Safe to run multiple times

BEGIN;

ALTER TABLE IF EXISTS core.court_bookings
    ADD COLUMN IF NOT EXISTS team_number INTEGER;

COMMIT;


