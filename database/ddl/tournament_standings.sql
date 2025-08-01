-- Migration script to create tournament_standings table
-- This table stores calculated standings for tournament groups

CREATE TABLE IF NOT EXISTS core.tournament_standings (
    standing_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id VARCHAR(255) NOT NULL,
    group_id VARCHAR(255) NOT NULL,
    team_id VARCHAR(255) NOT NULL,
    matches_played INTEGER DEFAULT 0,
    matches_won INTEGER DEFAULT 0,
    matches_lost INTEGER DEFAULT 0,
    matches_drawn INTEGER DEFAULT 0,
    goals_for INTEGER DEFAULT 0,
    goals_against INTEGER DEFAULT 0,
    goal_difference INTEGER DEFAULT 0,
    points INTEGER DEFAULT 0,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tournament_standings_tournament_id ON core.tournament_standings(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_standings_group_id ON core.tournament_standings(group_id);
CREATE INDEX IF NOT EXISTS idx_tournament_standings_team_id ON core.tournament_standings(team_id);
CREATE INDEX IF NOT EXISTS idx_tournament_standings_tournament_group ON core.tournament_standings(tournament_id, group_id);

-- Create unique constraint to prevent duplicate standings for the same team in the same group
CREATE UNIQUE INDEX IF NOT EXISTS idx_tournament_standings_unique_team 
ON core.tournament_standings(tournament_id, group_id, team_id);

-- Add comments for documentation
COMMENT ON TABLE core.tournament_standings IS 'Stores calculated standings for tournament groups';
COMMENT ON COLUMN core.tournament_standings.standing_id IS 'Primary key for the standings record';
COMMENT ON COLUMN core.tournament_standings.tournament_id IS 'Reference to the tournament';
COMMENT ON COLUMN core.tournament_standings.group_id IS 'Reference to the tournament group';
COMMENT ON COLUMN core.tournament_standings.team_id IS 'Reference to the tournament team';
COMMENT ON COLUMN core.tournament_standings.matches_played IS 'Total number of matches played by the team';
COMMENT ON COLUMN core.tournament_standings.matches_won IS 'Number of matches won by the team';
COMMENT ON COLUMN core.tournament_standings.matches_lost IS 'Number of matches lost by the team';
COMMENT ON COLUMN core.tournament_standings.matches_drawn IS 'Number of matches drawn by the team';
COMMENT ON COLUMN core.tournament_standings.goals_for IS 'Total goals/points scored by the team';
COMMENT ON COLUMN core.tournament_standings.goals_against IS 'Total goals/points conceded by the team';
COMMENT ON COLUMN core.tournament_standings.goal_difference IS 'Difference between goals for and goals against';
COMMENT ON COLUMN core.tournament_standings.points IS 'Total points (3 for win, 1 for draw, 0 for loss)';
COMMENT ON COLUMN core.tournament_standings.position IS 'Current position in the group standings';
COMMENT ON COLUMN core.tournament_standings.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN core.tournament_standings.updated_at IS 'Timestamp when the record was last updated'; 