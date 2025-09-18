-- Migration: Add playtomic_rating column to user table
-- Date: 2024-12-19
-- Description: Add playtomic_rating column with DECIMAL(3,2) format to store ratings from 0.00 to 7.00

-- Add playtomic_rating column to user table
ALTER TABLE core."user" 
ADD COLUMN playtomic_rating DECIMAL(3,2) DEFAULT NULL CHECK (playtomic_rating >= 0.00 AND playtomic_rating <= 7.00);

-- Add comment to document the column
COMMENT ON COLUMN core."user".playtomic_rating IS 'Playtomic rating in format 7.00 (range: 0.00 to 7.00, e.g., 4.50, 6.25, 7.00)';

-- Create index for better performance on rating queries
CREATE INDEX IF NOT EXISTS idx_user_playtomic_rating ON core."user"(playtomic_rating);
