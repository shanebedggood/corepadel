-- Test Players for Tournament Testing
-- This script inserts test players into the user table

-- First, let's get the club ID for reference
-- SELECT club_id, name FROM core.club WHERE name = '5am Padel Club';

-- Insert test players
INSERT INTO core.user (firebase_uid, email, username, first_name, last_name, display_name, mobile, rating, email_verified) VALUES
-- High-rated players
('test_player_001', 'john.smith@test.com', 'johnsmith', 'John', 'Smith', 'John Smith', '+27123456789', 85, true),
('test_player_002', 'sarah.jones@test.com', 'sarahjones', 'Sarah', 'Jones', 'Sarah Jones', '+27123456790', 82, true),
('test_player_003', 'mike.wilson@test.com', 'mikewilson', 'Mike', 'Wilson', 'Mike Wilson', '+27123456791', 88, true),
('test_player_004', 'lisa.brown@test.com', 'lisabrown', 'Lisa', 'Brown', 'Lisa Brown', '+27123456792', 80, true),

-- Medium-rated players
('test_player_005', 'david.garcia@test.com', 'davidgarcia', 'David', 'Garcia', 'David Garcia', '+27123456793', 75, true),
('test_player_006', 'emma.davis@test.com', 'emmadavis', 'Emma', 'Davis', 'Emma Davis', '+27123456794', 78, true),
('test_player_007', 'james.miller@test.com', 'jamesmiller', 'James', 'Miller', 'James Miller', '+27123456795', 72, true),
('test_player_008', 'anna.taylor@test.com', 'annataylor', 'Anna', 'Taylor', 'Anna Taylor', '+27123456796', 76, true),

-- Lower-rated players
('test_player_009', 'robert.anderson@test.com', 'robertanderson', 'Robert', 'Anderson', 'Robert Anderson', '+27123456797', 65, true),
('test_player_010', 'jennifer.thomas@test.com', 'jenniferthomas', 'Jennifer', 'Thomas', 'Jennifer Thomas', '+27123456798', 68, true),
('test_player_011', 'william.jackson@test.com', 'williamjackson', 'William', 'Jackson', 'William Jackson', '+27123456799', 62, true),
('test_player_012', 'maria.white@test.com', 'mariawhite', 'Maria', 'White', 'Maria White', '+27123456800', 70, true),

-- Additional players for larger tournaments
('test_player_013', 'christopher.lee@test.com', 'christopherlee', 'Christopher', 'Lee', 'Christopher Lee', '+27123456801', 73, true),
('test_player_014', 'jessica.harris@test.com', 'jessicaharris', 'Jessica', 'Harris', 'Jessica Harris', '+27123456802', 77, true),
('test_player_015', 'daniel.clark@test.com', 'danielclark', 'Daniel', 'Clark', 'Daniel Clark', '+27123456803', 71, true),
('test_player_016', 'ashley.lewis@test.com', 'ashleylewis', 'Ashley', 'Lewis', 'Ashley Lewis', '+27123456804', 74, true);

-- Verify the insertions
SELECT 'Test players inserted successfully' as status;
SELECT COUNT(*) as total_test_players FROM core.user WHERE firebase_uid LIKE 'test_player_%'; 