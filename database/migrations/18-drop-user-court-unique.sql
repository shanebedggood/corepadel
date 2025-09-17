-- Migration: Drop per-slot-per-user unique constraint to allow joining same court/time

BEGIN;

-- Drop the named constraint if present
ALTER TABLE IF EXISTS core.court_bookings
  DROP CONSTRAINT IF EXISTS court_bookings_user_court_unique;

-- Also drop any alternative names we might have used earlier
ALTER TABLE IF EXISTS core.court_bookings
  DROP CONSTRAINT IF EXISTS uq_court_bookings_user_slot_court;

COMMIT;


