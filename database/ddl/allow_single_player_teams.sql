-- Migration to allow teams with single players
-- This migration makes player2_uid nullable so teams can have only one player

-- Update the tournament_team table to allow player2_uid to be NULL
ALTER TABLE core.tournament_team ALTER COLUMN player2_uid DROP NOT NULL;

-- Add a comment to document the change
COMMENT ON COLUMN core.tournament_team.player2_uid IS 'Player 2 UID. Can be NULL for teams with only one player.'; 