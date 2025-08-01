-- Test Tournament Matches
-- This script creates test matches for an existing tournament

-- First, let's find existing tournaments, groups, and teams
-- SELECT tournament_id, name FROM core.tournament ORDER BY created_at DESC LIMIT 1;
-- SELECT group_id, name FROM core.tournament_group WHERE tournament_id = 'YOUR_TOURNAMENT_ID';
-- SELECT team_id, name, group_id FROM core.tournament_team WHERE tournament_id = 'YOUR_TOURNAMENT_ID';

-- Replace these IDs with actual values from your database:
-- 'YOUR_TOURNAMENT_ID' - tournament ID
-- 'GROUP_ID_A' - Group A ID
-- 'TEAM_A1_ID', 'TEAM_A2_ID', etc. - actual team IDs

-- Create group stage matches
INSERT INTO core.tournament_match (
    tournament_id, group_id, phase, round, 
    team1_id, team2_id, 
    team1_score, team2_score,
    team1_set1, team2_set1, team1_set2, team2_set2, team1_set3, team2_set3,
    winner_id, status, scheduled_time
) VALUES
-- Group A Matches - Round 1
('YOUR_TOURNAMENT_ID', 'GROUP_ID_A', 'group', 1, 'TEAM_A1_ID', 'TEAM_A2_ID', 2, 1, 6, 4, 4, 6, 6, 2, 'TEAM_A1_ID', 'completed', CURRENT_TIMESTAMP - INTERVAL '2 hours'),
('YOUR_TOURNAMENT_ID', 'GROUP_ID_A', 'group', 1, 'TEAM_A3_ID', 'TEAM_A4_ID', 1, 2, 6, 7, 6, 4, 3, 6, 'TEAM_A4_ID', 'completed', CURRENT_TIMESTAMP - INTERVAL '1 hour'),

-- Group A Matches - Round 2
('YOUR_TOURNAMENT_ID', 'GROUP_ID_A', 'group', 2, 'TEAM_A1_ID', 'TEAM_A3_ID', 2, 0, 6, 2, 6, 3, NULL, NULL, 'TEAM_A1_ID', 'completed', CURRENT_TIMESTAMP + INTERVAL '1 hour'),
('YOUR_TOURNAMENT_ID', 'GROUP_ID_A', 'group', 2, 'TEAM_A2_ID', 'TEAM_A4_ID', 0, 2, 4, 6, 3, 6, NULL, NULL, 'TEAM_A4_ID', 'completed', CURRENT_TIMESTAMP + INTERVAL '2 hours'),

-- Group A Matches - Round 3
('YOUR_TOURNAMENT_ID', 'GROUP_ID_A', 'group', 3, 'TEAM_A1_ID', 'TEAM_A4_ID', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'scheduled', CURRENT_TIMESTAMP + INTERVAL '3 hours'),
('YOUR_TOURNAMENT_ID', 'GROUP_ID_A', 'group', 3, 'TEAM_A2_ID', 'TEAM_A3_ID', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'scheduled', CURRENT_TIMESTAMP + INTERVAL '4 hours'),

-- Group B Matches - Round 1
('YOUR_TOURNAMENT_ID', 'GROUP_ID_B', 'group', 1, 'TEAM_B1_ID', 'TEAM_B2_ID', 2, 1, 6, 4, 7, 5, NULL, NULL, 'TEAM_B1_ID', 'completed', CURRENT_TIMESTAMP - INTERVAL '3 hours'),
('YOUR_TOURNAMENT_ID', 'GROUP_ID_B', 'group', 1, 'TEAM_B3_ID', 'TEAM_B4_ID', 1, 2, 6, 7, 4, 6, 2, 6, 'TEAM_B4_ID', 'completed', CURRENT_TIMESTAMP - INTERVAL '2 hours'),

-- Group B Matches - Round 2
('YOUR_TOURNAMENT_ID', 'GROUP_ID_B', 'group', 2, 'TEAM_B1_ID', 'TEAM_B3_ID', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'scheduled', CURRENT_TIMESTAMP + INTERVAL '5 hours'),
('YOUR_TOURNAMENT_ID', 'GROUP_ID_B', 'group', 2, 'TEAM_B2_ID', 'TEAM_B4_ID', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'scheduled', CURRENT_TIMESTAMP + INTERVAL '6 hours'),

-- Group B Matches - Round 3
('YOUR_TOURNAMENT_ID', 'GROUP_ID_B', 'group', 3, 'TEAM_B1_ID', 'TEAM_B4_ID', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'scheduled', CURRENT_TIMESTAMP + INTERVAL '7 hours'),
('YOUR_TOURNAMENT_ID', 'GROUP_ID_B', 'group', 3, 'TEAM_B2_ID', 'TEAM_B3_ID', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'scheduled', CURRENT_TIMESTAMP + INTERVAL '8 hours');

-- Verify the insertions
SELECT 'Test matches created successfully' as status;

-- Show match details
SELECT 
    tm.phase,
    tm.round,
    t1.name as team1_name,
    t2.name as team2_name,
    tm.team1_score,
    tm.team2_score,
    tm.status,
    tm.scheduled_time,
    CASE 
        WHEN tm.winner_id = t1.team_id THEN t1.name
        WHEN tm.winner_id = t2.team_id THEN t2.name
        ELSE 'TBD'
    END as winner
FROM core.tournament_match tm
JOIN core.tournament_team t1 ON tm.team1_id = t1.team_id
JOIN core.tournament_team t2 ON tm.team2_id = t2.team_id
WHERE tm.tournament_id = 'YOUR_TOURNAMENT_ID'
ORDER BY tm.phase, tm.round, tm.scheduled_time;

-- Show match count by status
SELECT 
    status,
    COUNT(*) as match_count
FROM core.tournament_match 
WHERE tournament_id = 'YOUR_TOURNAMENT_ID'
GROUP BY status
ORDER BY status; 