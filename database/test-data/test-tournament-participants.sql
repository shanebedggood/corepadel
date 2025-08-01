-- Test Tournament Participants
-- This script adds test participants to an existing tournament

-- First, let's find an existing tournament to add participants to
-- SELECT tournament_id, name, max_participants, current_participants FROM core.tournament ORDER BY created_at DESC LIMIT 1;

-- Replace 'YOUR_TOURNAMENT_ID' with an actual tournament ID from your database
-- You can get this by running: SELECT tournament_id, name FROM core.tournament LIMIT 1;

-- Add participants to tournament (replace TOURNAMENT_ID with actual ID)
INSERT INTO core.tournament_participant (tournament_id, uid, email, display_name, first_name, last_name, mobile, rating, added_by, added_at) VALUES
-- High-rated participants
('YOUR_TOURNAMENT_ID', 'test_player_001', 'john.smith@test.com', 'John Smith', 'John', 'Smith', '+27123456789', 85, 'd9180b40-f3b6-446a-a73a-b5a01a386cb4', CURRENT_TIMESTAMP),
('YOUR_TOURNAMENT_ID', 'test_player_002', 'sarah.jones@test.com', 'Sarah Jones', 'Sarah', 'Jones', '+27123456790', 82, 'd9180b40-f3b6-446a-a73a-b5a01a386cb4', CURRENT_TIMESTAMP),
('YOUR_TOURNAMENT_ID', 'test_player_003', 'mike.wilson@test.com', 'Mike Wilson', 'Mike', 'Wilson', '+27123456791', 88, 'd9180b40-f3b6-446a-a73a-b5a01a386cb4', CURRENT_TIMESTAMP),
('YOUR_TOURNAMENT_ID', 'test_player_004', 'lisa.brown@test.com', 'Lisa Brown', 'Lisa', 'Brown', '+27123456792', 80, 'd9180b40-f3b6-446a-a73a-b5a01a386cb4', CURRENT_TIMESTAMP),

-- Medium-rated participants
('YOUR_TOURNAMENT_ID', 'test_player_005', 'david.garcia@test.com', 'David Garcia', 'David', 'Garcia', '+27123456793', 75, 'd9180b40-f3b6-446a-a73a-b5a01a386cb4', CURRENT_TIMESTAMP),
('YOUR_TOURNAMENT_ID', 'test_player_006', 'emma.davis@test.com', 'Emma Davis', 'Emma', 'Davis', '+27123456794', 78, 'd9180b40-f3b6-446a-a73a-b5a01a386cb4', CURRENT_TIMESTAMP),
('YOUR_TOURNAMENT_ID', 'test_player_007', 'james.miller@test.com', 'James Miller', 'James', 'Miller', '+27123456795', 72, 'd9180b40-f3b6-446a-a73a-b5a01a386cb4', CURRENT_TIMESTAMP),
('YOUR_TOURNAMENT_ID', 'test_player_008', 'anna.taylor@test.com', 'Anna Taylor', 'Anna', 'Taylor', '+27123456796', 76, 'd9180b40-f3b6-446a-a73a-b5a01a386cb4', CURRENT_TIMESTAMP);

-- Update the tournament's current_participants count
-- UPDATE core.tournament SET current_participants = (SELECT COUNT(*) FROM core.tournament_participant WHERE tournament_id = 'YOUR_TOURNAMENT_ID') WHERE tournament_id = 'YOUR_TOURNAMENT_ID';

-- Verify the insertions
SELECT 'Test participants added successfully' as status;
SELECT COUNT(*) as total_participants FROM core.tournament_participant WHERE tournament_id = 'YOUR_TOURNAMENT_ID';

-- Show participant details
SELECT 
    tp.display_name,
    tp.rating,
    tp.added_at,
    t.name as tournament_name
FROM core.tournament_participant tp
JOIN core.tournament t ON tp.tournament_id = t.tournament_id
WHERE tp.tournament_id = 'YOUR_TOURNAMENT_ID'
ORDER BY tp.rating DESC; 