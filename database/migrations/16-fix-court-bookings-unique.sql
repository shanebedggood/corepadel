-- Migration: Allow multiple players per court/time by relaxing unique constraint
-- Previous schema enforced UNIQUE(booking_date, time_slot, venue_id, court_number)
-- which prevents filling the team. We will drop that unique and optionally enforce
-- per-user uniqueness to prevent the same user double-booking the same slot.

BEGIN;

-- Drop the old unique constraint if it exists (auto-generated name fallback)
ALTER TABLE IF EXISTS core.court_bookings
  DROP CONSTRAINT IF EXISTS court_bookings_booking_date_time_slot_venue_id_court_number_key;

-- Also handle possible explicit name if used elsewhere
ALTER TABLE IF EXISTS core.court_bookings
  DROP CONSTRAINT IF EXISTS uq_court_bookings_slot_court;

-- Optional: ensure a user can't double-book the same court/slot
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    WHERE t.relname = 'court_bookings'
      AND c.conname = 'uq_court_bookings_user_slot_court'
  ) THEN
    ALTER TABLE core.court_bookings
      ADD CONSTRAINT uq_court_bookings_user_slot_court
      UNIQUE (firebase_uid, booking_date, time_slot, venue_id, court_number);
  END IF;
END $$;

COMMIT;


