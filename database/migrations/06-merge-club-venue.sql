-- Migration script to merge Club and Venue entities into unified Club entity
-- This script handles the transition from separate club/venue tables to a unified club table

-- Step 1: Add new columns to club table
ALTER TABLE core.club 
ADD COLUMN IF NOT EXISTS type VARCHAR(20) NOT NULL DEFAULT 'CLUB',
ADD COLUMN IF NOT EXISTS address_id UUID REFERENCES core.address(address_id);

-- Step 2: Create club_facility table to replace venue_facility
CREATE TABLE IF NOT EXISTS core.club_facility (
    club_id UUID NOT NULL,
    facility_id UUID NOT NULL,
    quantity INTEGER,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (club_id, facility_id),
    FOREIGN KEY (club_id) REFERENCES core.club(club_id) ON DELETE CASCADE,
    FOREIGN KEY (facility_id) REFERENCES core.facility(facility_id) ON DELETE CASCADE
);

-- Step 3: Migrate venue data to club table
INSERT INTO core.club (club_id, name, website, type, address_id)
SELECT 
    venue_id as club_id,
    name,
    website,
    'VENUE' as type,
    address_id
FROM core.venue
ON CONFLICT (club_id) DO NOTHING;

-- Step 4: Migrate venue_facility data to club_facility
INSERT INTO core.club_facility (club_id, facility_id, quantity, notes, created_at)
SELECT 
    vf.venue_id as club_id,
    vf.facility_id,
    vf.quantity,
    vf.notes,
    vf.created_at
FROM core.venue_facility vf
ON CONFLICT (club_id, facility_id) DO NOTHING;

-- Step 5: Add new columns to tournament table for club relationships
ALTER TABLE core.tournament 
ADD COLUMN IF NOT EXISTS club_id_new UUID REFERENCES core.club(club_id),
ADD COLUMN IF NOT EXISTS venue_club_id UUID REFERENCES core.club(club_id);

-- Step 6: Migrate existing tournament club_id references
UPDATE core.tournament 
SET club_id_new = club_id::UUID
WHERE club_id IS NOT NULL AND club_id != '';

-- Step 7: Migrate existing tournament venue_id references to venue_club_id
UPDATE core.tournament 
SET venue_club_id = venue_id::UUID
WHERE venue_id IS NOT NULL AND venue_id != '';

-- Step 8: Drop old columns from tournament table
ALTER TABLE core.tournament 
DROP COLUMN IF EXISTS club_id,
DROP COLUMN IF EXISTS venue_id;

-- Step 9: Rename new columns to final names
ALTER TABLE core.tournament 
RENAME COLUMN club_id_new TO club_id;

-- Step 10: Make club_id NOT NULL after migration
ALTER TABLE core.tournament 
ALTER COLUMN club_id SET NOT NULL;

-- Step 11: Update user_club table to reference the unified club table
-- (This should already be correct, but let's ensure it's properly set up)
-- No changes needed as user_club already references core.club

-- Step 12: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_club_type ON core.club(type);
CREATE INDEX IF NOT EXISTS idx_club_facility_club_id ON core.club_facility(club_id);
CREATE INDEX IF NOT EXISTS idx_tournament_club_id ON core.tournament(club_id);
CREATE INDEX IF NOT EXISTS idx_tournament_venue_club_id ON core.tournament(venue_club_id);

-- Step 13: Add comments for documentation
COMMENT ON COLUMN core.club.type IS 'Type of organization: CLUB, VENUE, ACADEMY, LEAGUE';
COMMENT ON COLUMN core.tournament.club_id IS 'Club that owns/created the tournament';
COMMENT ON COLUMN core.tournament.venue_club_id IS 'Club (venue) that hosts the tournament';

-- Note: The old venue and venue_facility tables are kept for now for safety
-- They can be dropped in a future migration after verifying the data migration was successful
-- DROP TABLE IF EXISTS core.venue_facility;
-- DROP TABLE IF EXISTS core.venue;
