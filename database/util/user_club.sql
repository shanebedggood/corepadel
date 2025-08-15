-- User Club Associations
-- This script associates users with clubs

-- Associate admin user with 5am Padel Club
-- Note: You'll need to replace the user_id and club_id with actual UUIDs from your database
-- You can find these by running:
-- SELECT user_id, cognito_sub, email FROM core.user WHERE email = 'your-admin-email@example.com';
-- SELECT club_id, name FROM core.club WHERE name = '5am Padel Club';

-- Example (replace with actual UUIDs):
-- INSERT INTO core.user_club (user_id, club_id, role)
-- VALUES (
--     'your-user-uuid-here',
--     'your-club-uuid-here',
--     'owner'
-- );

-- To find the actual UUIDs, run these queries:
-- SELECT user_id, cognito_sub, email FROM core.user;
-- SELECT club_id, name FROM core.club;

-- Then uncomment and update the INSERT statement below with the actual UUIDs:

-- INSERT INTO core.user_club (user_id, club_id, role)
-- VALUES (
--     'REPLACE_WITH_ADMIN_USER_UUID',
--     'REPLACE_WITH_CLUB_UUID',
--     'owner'
-- ); 