-- Migration: Remove team position complexity (Fixed)
-- Description: Remove team_position column and simplify team logic to just require 2 players per team

-- First, drop the view that depends on team_position
DROP VIEW IF EXISTS core.court_team_compositions;

-- Drop the existing unique constraint that includes team_position
ALTER TABLE core.court_bookings DROP CONSTRAINT IF EXISTS court_bookings_team_position_unique;

-- Drop the index on team_position
DROP INDEX IF EXISTS core.idx_court_bookings_teams;

-- Drop the team_position column
ALTER TABLE core.court_bookings DROP COLUMN IF EXISTS team_position;

-- Create a new index for team-based queries
CREATE INDEX idx_court_bookings_teams_simplified ON core.court_bookings 
    (booking_date, time_slot, venue_id, court_number, team_number, status) 
    WHERE status = 'confirmed';

-- Update the court_team_compositions view to remove team_position references
CREATE VIEW core.court_team_compositions AS
SELECT 
    cb.booking_date,
    cb.time_slot,
    cb.venue_id,
    cb.court_number,
    cb.team_number,
    COUNT(*) as player_count,
    STRING_AGG(cb.firebase_uid, ', ' ORDER BY cb.created_at) as player_uids
FROM core.court_bookings cb
WHERE cb.status = 'confirmed'
GROUP BY cb.booking_date, cb.time_slot, cb.venue_id, cb.court_number, cb.team_number
ORDER BY cb.booking_date, cb.time_slot, cb.venue_id, cb.court_number, cb.team_number;

-- Add a comment explaining the simplified team logic
COMMENT ON TABLE core.court_bookings IS 'Court bookings with simplified team logic - each team can have up to 2 players, no specific positions required';
COMMENT ON COLUMN core.court_bookings.team_number IS 'Team number (1 or 2) - each team can have up to 2 players';
