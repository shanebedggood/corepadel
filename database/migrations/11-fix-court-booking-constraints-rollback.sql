-- Rollback script for court booking constraints fix
-- This script reverts the changes made in 11-fix-court-booking-constraints.sql

-- Connect to the corepadel database
\c corepadel;

-- Set search path to include core schema
SET search_path TO core, public;

-- Drop the new constraint that allows multiple players per court
ALTER TABLE core.court_bookings 
DROP CONSTRAINT IF EXISTS court_bookings_user_court_unique;

-- Drop the new index
DROP INDEX IF EXISTS core.idx_court_bookings_court_players;

-- Drop the court number positive check constraint
ALTER TABLE core.court_bookings 
DROP CONSTRAINT IF EXISTS court_bookings_court_number_positive;

-- Restore the original unique constraint (this will prevent multiple players per court)
ALTER TABLE core.court_bookings 
ADD CONSTRAINT court_bookings_booking_date_time_slot_venue_id_court_number_key 
UNIQUE (booking_date, time_slot, venue_id, court_number);

-- Restore the original table comment
COMMENT ON TABLE core.court_bookings 
IS 'Player bookings for specific court time slots';
