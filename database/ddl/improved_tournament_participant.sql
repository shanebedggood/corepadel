-- Improved tournament participant table design
-- This references the user table instead of duplicating data

-- Drop the old table (run this after data migration)
-- DROP TABLE IF EXISTS core.tournament_participant;

-- Create improved tournament participant table
CREATE TABLE IF NOT EXISTS core.tournament_participant_improved (
    participant_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL REFERENCES core.tournament(tournament_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES core.users(user_id) ON DELETE CASCADE,
    added_by VARCHAR(255) NOT NULL,
    UNIQUE(tournament_id, user_id)
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_tournament_participant_tournament_id ON core.tournament_participant_improved(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_participant_user_id ON core.tournament_participant_improved(user_id);

-- Migration script to move data from old to new table
-- Run this after creating the new table
/*
INSERT INTO core.tournament_participant_improved (tournament_id, user_id, added_by, added_at)
SELECT 
    tp.tournament_id,
    u.user_id,
    tp.added_by,
    tp.added_at
FROM core.tournament_participant tp
JOIN core.users u ON tp.uid = u.firebase_uid
WHERE NOT EXISTS (
    SELECT 1 FROM core.tournament_participant_improved tpi 
    WHERE tpi.tournament_id = tp.tournament_id AND tpi.user_id = u.user_id
);
*/ 