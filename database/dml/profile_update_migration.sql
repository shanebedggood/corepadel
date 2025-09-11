-- Profile Update Feature Migration
-- This script adds the necessary fields for the profile update feature

-- Add interests array column to users table
ALTER TABLE core.user ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}';

-- Add profile_completed flag to users table
ALTER TABLE core.user ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT FALSE;

-- Add profile_picture column if it doesn't exist
ALTER TABLE core.user ADD COLUMN IF NOT EXISTS profile_picture TEXT;

-- Create index on profile_completed for faster queries
CREATE INDEX IF NOT EXISTS idx_users_profile_completed ON core.user(profile_completed);

-- Create index on interests for faster queries
CREATE INDEX IF NOT EXISTS idx_users_interests ON core.user USING GIN(interests);

-- Update existing users to mark profiles as completed if they have basic information
UPDATE core.user 
SET profile_completed = TRUE 
WHERE (first_name IS NOT NULL AND first_name != '') 
   OR (last_name IS NOT NULL AND last_name != '') 
   OR (display_name IS NOT NULL AND display_name != '');

-- Add comments to document the new columns
COMMENT ON COLUMN core.user.interests IS 'Array of user interests (e.g., padel, running)';
COMMENT ON COLUMN core.user.profile_completed IS 'Flag indicating if user has completed their profile setup';
COMMENT ON COLUMN core.user.profile_picture IS 'URL or path to user profile picture';
