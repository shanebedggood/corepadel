-- Add sample ratings to tournament participants
-- This script adds random ratings between 1-10 to existing participants

-- First, let's see what participants we have
SELECT 
    participant_id,
    display_name,
    email,
    rating
FROM core.tournament_participant
WHERE rating = 0 OR rating IS NULL;

-- Update participants with random ratings between 1-10
UPDATE core.tournament_participant 
SET rating = FLOOR(RANDOM() * 10) + 1
WHERE rating = 0 OR rating IS NULL;

-- Verify the updates
SELECT 
    participant_id,
    display_name,
    email,
    rating
FROM core.tournament_participant
ORDER BY rating DESC; 