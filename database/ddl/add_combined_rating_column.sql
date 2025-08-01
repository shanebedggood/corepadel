-- Migration script to add combined_rating column to tournament_team table
-- This script should be run to update existing databases

-- Add the combined_rating column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'core' 
        AND table_name = 'tournament_team' 
        AND column_name = 'combined_rating'
    ) THEN
        ALTER TABLE core.tournament_team ADD COLUMN combined_rating INTEGER;
    END IF;
END $$;

-- Update existing teams with calculated combined ratings
UPDATE core.tournament_team 
SET combined_rating = (
    SELECT COALESCE(SUM(tp.rating), 0)
    FROM core.tournament_participant tp
    WHERE tp.tournament_id = core.tournament_team.tournament_id
    AND tp.uid IN (
        CASE 
            WHEN core.tournament_team.player1_uid IS NOT NULL THEN core.tournament_team.player1_uid
            ELSE NULL
        END,
        CASE 
            WHEN core.tournament_team.player2_uid IS NOT NULL THEN core.tournament_team.player2_uid
            ELSE NULL
        END
    )
)
WHERE combined_rating IS NULL; 