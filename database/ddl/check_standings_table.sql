-- Check if tournament_standings table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'core' 
    AND table_name = 'tournament_standings'
);

-- If table doesn't exist, show what tables are in the core schema
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'core' 
ORDER BY table_name; 