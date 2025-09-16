-- Fix Court Booking Constraints for 4-Player Padel Games
-- This migration removes the unique constraint that prevents multiple players from booking the same court
-- and adds proper constraints to allow up to 4 players per court while preventing duplicate user bookings

-- Connect to the corepadel database
\c corepadel;

-- Set search path to include core schema
SET search_path TO core, public;

-- Drop the existing unique constraint that prevents multiple players per court
ALTER TABLE core.court_bookings 
DROP CONSTRAINT IF EXISTS court_bookings_booking_date_time_slot_venue_id_court_number_key;

-- Add a new unique constraint that prevents the same user from booking the same court multiple times
-- This allows multiple players (up to 4) to book the same court, but prevents duplicate bookings by the same user
ALTER TABLE core.court_bookings 
ADD CONSTRAINT court_bookings_user_court_unique 
UNIQUE (firebase_uid, booking_date, time_slot, venue_id, court_number);

-- Add a check constraint to ensure court_number is positive when specified
ALTER TABLE core.court_bookings 
ADD CONSTRAINT court_bookings_court_number_positive 
CHECK (court_number IS NULL OR court_number > 0);

-- Add a comment explaining the new constraint structure
COMMENT ON CONSTRAINT court_bookings_user_court_unique ON core.court_bookings 
IS 'Prevents the same user from booking the same court multiple times, but allows up to 4 different users per court';

-- Create an index to improve performance for queries checking player count per court
CREATE INDEX IF NOT EXISTS idx_court_bookings_court_players 
ON core.court_bookings (booking_date, time_slot, venue_id, court_number, status) 
WHERE status = 'confirmed';

-- Add a comment for the new index
COMMENT ON INDEX idx_court_bookings_court_players 
IS 'Index to efficiently count confirmed players per court for availability checks';

-- Update the table comment to reflect the new 4-player constraint
COMMENT ON TABLE core.court_bookings 
IS 'Player bookings for specific court time slots - allows up to 4 players per court';
