-- Get Club ID for 5am Padel Club
-- Run this script to find the club_id for the 5am Padel Club

SELECT 
    club_id,
    name,
    website
FROM core.club 
WHERE name = '5am Padel Club';

-- If you need to create the club association manually, use the club_id from above
-- and run a query like this (replace the UUIDs with actual values):

INSERT INTO core.user_club (user_id, club_id, role)
VALUES (
    'd9180b40-f3b6-446a-a73a-b5a01a386cb4',
    'da6d2118-7237-4bb5-9f2d-17ba3e07d55e',
    'owner'
);

-- To find your user_id, run:
-- SELECT user_id, firebase_uid, email FROM core.user WHERE email = 'your-email@example.com'; 



club da6d2118-7237-4bb5-9f2d-17ba3e07d55e
user d9180b40-f3b6-446a-a73a-b5a01a386cb4
