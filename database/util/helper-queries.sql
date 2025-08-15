-- Helper Queries for Tournament Testing
-- Use these queries to find IDs and verify data

-- ========================================
-- FIND TOURNAMENT ID
-- ========================================
-- Get the most recent tournament
SELECT tournament_id, name, max_participants, current_participants, created_at 
FROM core.tournament 
ORDER BY created_at DESC 
LIMIT 5;

-- ========================================
-- FIND CLUB ID
-- ========================================
-- Get club information
SELECT club_id, name, website 
FROM core.club 
ORDER BY name;

-- ========================================
-- FIND USER ID (for admin user)
-- ========================================
-- Get admin user information
SELECT user_id, cognito_sub, email, display_name 
FROM core.user 
WHERE cognito_sub = 'd9180b40-f3b6-446a-a73a-b5a01a386cb4';

-- ========================================
-- FIND TOURNAMENT CONFIG IDs
-- ========================================
-- Get format IDs
SELECT format_id, name, description 
FROM core.format 
ORDER BY name;

-- Get category IDs
SELECT category_id, name, description 
FROM core.category 
ORDER BY name;

-- Get status IDs
SELECT status_id, name, description, color 
FROM core.tournament_status 
ORDER BY name;

-- Get registration type IDs
SELECT registration_type_id, name, description 
FROM core.registration_type 
ORDER BY name;

-- Get venue type IDs
SELECT venue_type_id, name, description 
FROM core.venue_type 
ORDER BY name;

-- ========================================
-- VERIFY TOURNAMENT DATA
-- ========================================
-- Check tournament participants
SELECT 
    t.name as tournament_name,
    COUNT(tp.participant_id) as participant_count,
    t.max_participants,
    t.current_participants
FROM core.tournament t
LEFT JOIN core.tournament_participant tp ON t.tournament_id = tp.tournament_id
GROUP BY t.tournament_id, t.name, t.max_participants, t.current_participants
ORDER BY t.created_at DESC;

-- Check tournament groups
SELECT 
    t.name as tournament_name,
    COUNT(tg.group_id) as group_count,
    SUM(tg.current_teams) as total_teams
FROM core.tournament t
LEFT JOIN core.tournament_group tg ON t.tournament_id = tg.tournament_id
GROUP BY t.tournament_id, t.name
ORDER BY t.created_at DESC;

-- Check tournament matches
SELECT 
    t.name as tournament_name,
    COUNT(tm.match_id) as match_count,
    COUNT(CASE WHEN tm.status = 'completed' THEN 1 END) as completed_matches,
    COUNT(CASE WHEN tm.status = 'scheduled' THEN 1 END) as scheduled_matches
FROM core.tournament t
LEFT JOIN core.tournament_match tm ON t.tournament_id = tm.tournament_id
GROUP BY t.tournament_id, t.name
ORDER BY t.created_at DESC;

-- ========================================
-- FIND SPECIFIC TOURNAMENT DETAILS
-- ========================================
-- Replace 'YOUR_TOURNAMENT_ID' with actual tournament ID
-- SELECT 
--     t.name as tournament_name,
--     t.max_participants,
--     t.current_participants,
--     f.name as format,
--     c.name as category,
--     ts.name as status,
--     cl.name as club_name
-- FROM core.tournament t
-- LEFT JOIN core.format f ON t.format_id = f.format_id
-- LEFT JOIN core.category c ON t.category_id = c.category_id
-- LEFT JOIN core.tournament_status ts ON t.status_id = ts.status_id
-- LEFT JOIN core.club cl ON t.club_id = cl.club_id
-- WHERE t.tournament_id = 'YOUR_TOURNAMENT_ID';

-- ========================================
-- CLEANUP QUERIES (use with caution!)
-- ========================================
-- Delete test participants from a specific tournament
-- DELETE FROM core.tournament_participant WHERE tournament_id = 'YOUR_TOURNAMENT_ID' AND uid LIKE 'test_player_%';

-- Delete test matches from a specific tournament
-- DELETE FROM core.tournament_match WHERE tournament_id = 'YOUR_TOURNAMENT_ID';

-- Delete test teams from a specific tournament
-- DELETE FROM core.tournament_team WHERE tournament_id = 'YOUR_TOURNAMENT_ID';

-- Delete test groups from a specific tournament
-- DELETE FROM core.tournament_group WHERE tournament_id = 'YOUR_TOURNAMENT_ID';

-- Delete test players (all test data)
-- DELETE FROM core.user WHERE cognito_sub LIKE 'test_player_%'; 