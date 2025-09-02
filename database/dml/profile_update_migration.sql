2024

-- Add comments to document the new columns
COMMENT ON COLUMN users.interests IS 'Array of user interests (e.g., padel, running)';
COMMENT ON COLUMN users.profile_completed IS 'Flag indicating if user has completed their profile setup';
COMMENT ON COLUMN users.profile_picture IS 'URL or path to user profile picture';
