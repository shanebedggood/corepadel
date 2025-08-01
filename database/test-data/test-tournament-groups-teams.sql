-- Test Tournament Groups and Teams
-- This script creates groups and teams for an existing tournament

-- First, let's find an existing tournament
-- SELECT tournament_id, name, max_participants, current_participants FROM core.tournament ORDER BY created_at DESC LIMIT 1;

-- Replace 'YOUR_TOURNAMENT_ID' with an actual tournament ID from your database
-- You can get this by running: SELECT tournament_id, name FROM core.tournament LIMIT 1;

-- Create tournament groups
INSERT INTO core.tournament_group (tournament_id, name, max_teams, current_teams, venue_id, created_at, updated_at) VALUES
('YOUR_TOURNAMENT_ID', 'Group A', 4, 0, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('YOUR_TOURNAMENT_ID', 'Group B', 4, 0, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('YOUR_TOURNAMENT_ID', 'Group C', 4, 0, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('YOUR_TOURNAMENT_ID', 'Group D', 4, 0, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Get the group IDs for team creation
-- SELECT group_id, name FROM core.tournament_group WHERE tournament_id = 'YOUR_TOURNAMENT_ID';

-- Create teams (replace GROUP_ID_A, GROUP_ID_B, etc. with actual group IDs)
INSERT INTO core.tournament_team (tournament_id, group_id, name, player_uids, created_at, updated_at) VALUES
-- Group A Teams
('YOUR_TOURNAMENT_ID', 'GROUP_ID_A', 'Team A1', ARRAY['test_player_001', 'test_player_002'], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('YOUR_TOURNAMENT_ID', 'GROUP_ID_A', 'Team A2', ARRAY['test_player_003', 'test_player_004'], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('YOUR_TOURNAMENT_ID', 'GROUP_ID_A', 'Team A3', ARRAY['test_player_005', 'test_player_006'], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('YOUR_TOURNAMENT_ID', 'GROUP_ID_A', 'Team A4', ARRAY['test_player_007', 'test_player_008'], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Group B Teams
('YOUR_TOURNAMENT_ID', 'GROUP_ID_B', 'Team B1', ARRAY['test_player_009', 'test_player_010'], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('YOUR_TOURNAMENT_ID', 'GROUP_ID_B', 'Team B2', ARRAY['test_player_011', 'test_player_012'], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('YOUR_TOURNAMENT_ID', 'GROUP_ID_B', 'Team B3', ARRAY['test_player_013', 'test_player_014'], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('YOUR_TOURNAMENT_ID', 'GROUP_ID_B', 'Team B4', ARRAY['test_player_015', 'test_player_016'], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Update group current_teams count
-- UPDATE core.tournament_group SET current_teams = (
--     SELECT COUNT(*) FROM core.tournament_team WHERE group_id = core.tournament_group.group_id
-- ) WHERE tournament_id = 'YOUR_TOURNAMENT_ID';

-- Verify the insertions
SELECT 'Test groups and teams created successfully' as status;

-- Show groups and their teams
SELECT 
    tg.name as group_name,
    tg.max_teams,
    tg.current_teams,
    COUNT(tt.team_id) as actual_teams
FROM core.tournament_group tg
LEFT JOIN core.tournament_team tt ON tg.group_id = tt.group_id
WHERE tg.tournament_id = 'YOUR_TOURNAMENT_ID'
GROUP BY tg.group_id, tg.name, tg.max_teams, tg.current_teams
ORDER BY tg.name;

-- Show team details with player names
SELECT 
    tt.name as team_name,
    tg.name as group_name,
    array_to_string(tt.player_uids, ', ') as player_uids
FROM core.tournament_team tt
JOIN core.tournament_group tg ON tt.group_id = tg.group_id
WHERE tt.tournament_id = 'YOUR_TOURNAMENT_ID'
ORDER BY tg.name, tt.name; 