-- User Club Role Refactor Migration
-- This script updates the user_club table to use role_id instead of role string
-- and adds tournament access_type field

-- Connect to the corepadel database
\c corepadel;

-- Set search path to include core schema
SET search_path TO core, public;

-- Step 1: Add role_id column to user_club table
ALTER TABLE core.user_club ADD COLUMN IF NOT EXISTS role_id UUID;

-- Step 2: Create foreign key constraint to role table
ALTER TABLE core.user_club ADD CONSTRAINT fk_user_club_role 
    FOREIGN KEY (role_id) REFERENCES core.role(role_id) ON DELETE RESTRICT;

-- Step 3: Update existing user_club records to reference the correct role
UPDATE core.user_club 
SET role_id = r.role_id 
FROM core.role r 
WHERE core.user_club.role = r.role_name;

-- Step 4: Make role_id NOT NULL after populating it
ALTER TABLE core.user_club ALTER COLUMN role_id SET NOT NULL;

-- Step 5: Drop the old role column (after ensuring all data is migrated)
ALTER TABLE core.user_club DROP COLUMN IF EXISTS role;

-- Step 6: Create index on role_id for better performance
CREATE INDEX IF NOT EXISTS idx_user_club_role_id ON core.user_club(role_id);

-- Step 7: Ensure the role table has the required club roles
INSERT INTO core.role (role_id, role_name) 
VALUES 
    (gen_random_uuid(), 'member'),
    (gen_random_uuid(), 'admin'),
    (gen_random_uuid(), 'owner')
ON CONFLICT (role_name) DO NOTHING;

-- Step 8: Add access_type column to tournament table if it doesn't exist
ALTER TABLE core.tournament ADD COLUMN IF NOT EXISTS access_type VARCHAR(20) DEFAULT 'open';

-- Step 9: Create index on access_type for better performance
CREATE INDEX IF NOT EXISTS idx_tournament_access_type ON core.tournament(access_type);

-- Step 10: Add comments for documentation
COMMENT ON COLUMN core.user_club.role_id IS 'Reference to the role table for club membership role';
COMMENT ON COLUMN core.tournament.access_type IS 'Tournament access type: open (all players) or closed (club members only)';

-- Grant permissions to corepadel user
GRANT ALL PRIVILEGES ON TABLE core.user_club TO corepadel;
GRANT ALL PRIVILEGES ON TABLE core.tournament TO corepadel;
