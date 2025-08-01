-- Migration to remove created_by column from tournament table
-- Since the application doesn't use createdBy, createdAt, or updatedAt fields

-- Remove the created_by column from the tournament table
ALTER TABLE core.tournament DROP COLUMN IF EXISTS created_by; 