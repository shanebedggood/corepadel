-- Create tournament_standings table if it doesn't exist
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

-- Verify table was created
SELECT 'tournament_standings table created successfully' as status; 