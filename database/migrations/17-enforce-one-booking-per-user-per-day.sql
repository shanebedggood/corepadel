-- Migration: Enforce at most one confirmed booking per user per day
-- Also remove prior per-slot user unique if present

BEGIN;

-- Drop previous per-slot unique constraint if it exists
ALTER TABLE IF EXISTS core.court_bookings
  DROP CONSTRAINT IF EXISTS uq_court_bookings_user_slot_court;

-- Drop any existing unique index on (firebase_uid, booking_date) to avoid duplicates
DROP INDEX IF EXISTS core.unique_user_booking_per_day;

-- Create partial unique index only for confirmed bookings
CREATE UNIQUE INDEX unique_user_booking_per_day
  ON core.court_bookings(firebase_uid, booking_date)
  WHERE status = 'confirmed';

COMMIT;


