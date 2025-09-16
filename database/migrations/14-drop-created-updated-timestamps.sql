-- Migration: Drop created_at and updated_at columns and related indexes
-- Safe to run multiple times with IF EXISTS guards

BEGIN;

-- Court schedules
ALTER TABLE IF EXISTS core.court_schedules
    DROP COLUMN IF EXISTS created_at,
    DROP COLUMN IF EXISTS updated_at;

ALTER TABLE IF EXISTS core.court_schedule_days
    DROP COLUMN IF EXISTS created_at,
    DROP COLUMN IF EXISTS updated_at;

-- Court bookings
ALTER TABLE IF EXISTS core.court_bookings
    DROP COLUMN IF EXISTS created_at,
    DROP COLUMN IF EXISTS updated_at;

-- Run bookings
ALTER TABLE IF EXISTS core.run_booking
    DROP COLUMN IF EXISTS created_at,
    DROP COLUMN IF EXISTS updated_at;

-- Club facility
ALTER TABLE IF EXISTS core.club_facility
    DROP COLUMN IF EXISTS created_at;

-- Rules (if present in core schema)
ALTER TABLE IF EXISTS core.padel_rule
    DROP COLUMN IF EXISTS created_at,
    DROP COLUMN IF EXISTS updated_at;

ALTER TABLE IF EXISTS core.rule_section
    DROP COLUMN IF EXISTS created_at,
    DROP COLUMN IF EXISTS updated_at;

-- Drop indexes that reference created_at (if any exist)
DROP INDEX IF EXISTS core.idx_run_booking_created;

COMMIT;


