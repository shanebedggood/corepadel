-- Add Court Count to Schedule Days Migration
-- This script adds the court_count field to the court_schedule_days table

-- Connect to the corepadel database
\c corepadel;

-- Set search path to include core schema
SET search_path TO core, public;

-- Add court_count column to court_schedule_days table
ALTER TABLE core.court_schedule_days 
ADD COLUMN IF NOT EXISTS court_count INTEGER NOT NULL DEFAULT 1;

-- Add constraint to ensure court_count is positive
ALTER TABLE core.court_schedule_days 
ADD CONSTRAINT chk_court_count_positive CHECK (court_count > 0);

-- Add constraint to ensure court_count is reasonable (max 20 courts per time slot)
ALTER TABLE core.court_schedule_days 
ADD CONSTRAINT chk_court_count_max CHECK (court_count <= 20);

-- Update existing records to have court_count = 1 (default)
UPDATE core.court_schedule_days 
SET court_count = 1 
WHERE court_count IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN core.court_schedule_days.court_count IS 'Number of courts available for this time slot (1-20)';

-- Create index for better performance on court_count queries
CREATE INDEX IF NOT EXISTS idx_court_schedule_days_court_count ON core.court_schedule_days(court_count);

-- Grant permissions to corepadel user
GRANT ALL PRIVILEGES ON TABLE core.court_schedule_days TO corepadel;
