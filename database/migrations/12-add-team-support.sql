-- Add Team Support for Padel Court Bookings
-- This migration adds team information to court bookings to support 2 teams of 2 players each

-- Connect to the corepadel database
\c corepadel;

-- Set search path to include core schema
SET search_path TO core, public;

-- Add team information columns to court_bookings table
ALTER TABLE core.court_bookings 
ADD COLUMN IF NOT EXISTS team_number INTEGER CHECK (team_number IN (1, 2)),
ADD COLUMN IF NOT EXISTS team_position INTEGER CHECK (team_position IN (1, 2));

-- Add a comment explaining the team structure
COMMENT ON COLUMN core.court_bookings.team_number IS 'Team number: 1 or 2 (padel has 2 teams of 2 players each)';
COMMENT ON COLUMN core.court_bookings.team_position IS 'Position within team: 1 or 2 (each team has 2 players)';

-- Create a unique constraint to ensure each team position is unique per court
-- This prevents having more than 2 players per team per court
ALTER TABLE core.court_bookings 
ADD CONSTRAINT court_bookings_team_position_unique 
UNIQUE (booking_date, time_slot, venue_id, court_number, team_number, team_position);

-- Create an index for efficient team queries
CREATE INDEX IF NOT EXISTS idx_court_bookings_teams 
ON core.court_bookings (booking_date, time_slot, venue_id, court_number, team_number, team_position, status) 
WHERE status = 'confirmed';

-- Add a comment for the new index
COMMENT ON INDEX idx_court_bookings_teams 
IS 'Index to efficiently query team compositions and available team positions';

-- Update the table comment to reflect team support
COMMENT ON TABLE core.court_bookings 
IS 'Player bookings for specific court time slots - supports 2 teams of 2 players each (4 players total)';

-- Create a view to easily see team compositions
CREATE OR REPLACE VIEW core.court_team_compositions AS
SELECT 
    booking_date,
    time_slot,
    venue_id,
    court_number,
    team_number,
    team_position,
    firebase_uid,
    status,
    created_at
FROM core.court_bookings 
WHERE status = 'confirmed'
ORDER BY booking_date, time_slot, venue_id, court_number, team_number, team_position;

-- Add comment for the view
COMMENT ON VIEW core.court_team_compositions 
IS 'View showing current team compositions for all confirmed court bookings';

-- Grant permissions on the new view
GRANT SELECT ON core.court_team_compositions TO corepadel;
