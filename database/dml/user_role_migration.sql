-- User Role Table Migration
-- This script updates the user_role table to properly reference the role table

-- First, add the new user_role_id column
ALTER TABLE core.user_role ADD COLUMN IF NOT EXISTS user_role_id UUID DEFAULT gen_random_uuid();

-- Make user_role_id the primary key
ALTER TABLE core.user_role DROP CONSTRAINT IF EXISTS user_role_pkey;
ALTER TABLE core.user_role ADD PRIMARY KEY (user_role_id);

-- Add the role_id column to reference core.role
ALTER TABLE core.user_role ADD COLUMN IF NOT EXISTS role_id UUID;

-- Create foreign key constraint to role table
ALTER TABLE core.user_role ADD CONSTRAINT fk_user_role_role 
    FOREIGN KEY (role_id) REFERENCES core.role(role_id) ON DELETE RESTRICT;

-- Update existing user_role records to reference the correct role
UPDATE core.user_role 
SET role_id = r.role_id 
FROM core.role r 
WHERE core.user_role.role_name = r.role_name;

-- Make role_id NOT NULL after populating it
ALTER TABLE core.user_role ALTER COLUMN role_id SET NOT NULL;

-- Drop the old role_name column (after ensuring all data is migrated)
ALTER TABLE core.user_role DROP COLUMN IF EXISTS role_name;

-- Create index on role_id for better performance
CREATE INDEX IF NOT EXISTS idx_user_role_role_id ON core.user_role(role_id);

-- Ensure the role table has the required roles
INSERT INTO core.role (role_id, role_name) 
VALUES 
    (gen_random_uuid(), 'player'),
    (gen_random_uuid(), 'admin'),
    (gen_random_uuid(), 'sysadmin')
ON CONFLICT (role_name) DO NOTHING;
