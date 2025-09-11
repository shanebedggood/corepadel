-- Migration Script: Normalize Facilities Structure
-- This script creates the new facilities tables and migrates existing data

-- Connect to the corepadel database
\c corepadel;

-- Set search path to include core schema
SET search_path TO core, public;

-- Step 1: Create the new facilities table
CREATE TABLE IF NOT EXISTS core.facility (
    facility_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(100),
    category VARCHAR(100) NOT NULL DEFAULT 'Amenity',
    is_countable BOOLEAN DEFAULT FALSE,
    unit VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 2: Create the venue-facility junction table
CREATE TABLE IF NOT EXISTS core.venue_facility (
    venue_id UUID NOT NULL REFERENCES core.venue(venue_id) ON DELETE CASCADE,
    facility_id UUID NOT NULL REFERENCES core.facility(facility_id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (venue_id, facility_id)
);

-- Step 3: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_facility_name ON core.facility(name);
CREATE INDEX IF NOT EXISTS idx_facility_category ON core.facility(category);
CREATE INDEX IF NOT EXISTS idx_venue_facility_venue ON core.venue_facility(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_facility_facility ON core.venue_facility(facility_id);

-- Step 4: Populate with common facilities based on actual venue data
INSERT INTO core.facility (name, description, category, is_countable, unit) VALUES
-- Court facilities (countable)
('Courts', 'Padel courts (indoor/outdoor)', 'Court', TRUE, 'courts'),

-- Amenity facilities (non-countable)
('WiFi', 'Wireless internet access', 'Amenity', FALSE, NULL),
('Equipment Rental', 'Racket and ball rental service', 'Amenity', FALSE, NULL),
('Restaurant', 'Full-service restaurant', 'Amenity', FALSE, NULL),
('Pro Shop', 'Professional equipment shop', 'Amenity', FALSE, NULL),
('Changing Rooms', 'Changing and storage facilities', 'Amenity', FALSE, NULL),
('Showers', 'Shower facilities', 'Amenity', FALSE, NULL),
('Free Parking', 'Complimentary parking', 'Amenity', FALSE, NULL),
('Private Parking', 'Reserved parking spaces', 'Amenity', FALSE, NULL),
('Store', 'General store/shop', 'Amenity', FALSE, NULL),
('Cafeteria', 'Self-service food area', 'Amenity', FALSE, NULL),
('Snack Bar', 'Quick food and drinks', 'Amenity', FALSE, NULL),
('Lockers', 'Secure storage lockers', 'Amenity', FALSE, NULL),
('Disabled Access', 'Wheelchair accessible facilities', 'Amenity', FALSE, NULL),
('Play Park', 'Children''s play area', 'Amenity', FALSE, NULL),
('Kids Playground', 'Children''s playground equipment', 'Amenity', FALSE, NULL),
('Supervised Kids Area', 'Monitored children''s space', 'Amenity', FALSE, NULL),

-- Service facilities (non-countable)
('Physiotherapist', 'Physical therapy services', 'Service', FALSE, NULL),
('Warm-up Area', 'Pre-game warm-up space', 'Service', FALSE, NULL),
('Sauna', 'Sauna facilities', 'Service', FALSE, NULL),
('Hyperbaric Oxygen Chamber', 'Recovery and therapy chamber', 'Service', FALSE, NULL),
('Halaal Coffee Shop', 'Halaal-certified coffee shop', 'Service', FALSE, NULL),
('Prayer Room', 'Religious prayer space', 'Service', FALSE, NULL),
('Co-working Space', 'Shared workspace for professionals', 'Service', FALSE, NULL)
ON CONFLICT (name) DO NOTHING;

-- Step 5: Migrate existing facilities data
-- This is a placeholder for the actual migration logic
-- The actual migration will need to parse the existing comma-separated facilities string
-- and create appropriate venue_facility relationships

-- Example migration logic (commented out as it needs venue data):
/*
-- For each venue with existing facilities:
-- 1. Parse the comma-separated facilities string
-- 2. Create facility records if they don't exist
-- 3. Create venue_facility relationships
-- 4. Handle quantities (e.g., "3 Indoor Courts" -> quantity = 3)

-- This would be implemented as a separate migration script or application logic
*/

-- Step 6: Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA core TO corepadel;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA core TO corepadel;

-- Step 7: Add comments for documentation
COMMENT ON TABLE core.facility IS 'Available facilities that can be associated with venues';
COMMENT ON TABLE core.venue_facility IS 'Many-to-many relationship between venues and facilities with quantities';
COMMENT ON COLUMN core.facility.is_countable IS 'Whether this facility can have a quantity greater than 1';
COMMENT ON COLUMN core.facility.unit IS 'Unit of measurement for countable facilities (e.g., courts, spaces)';
COMMENT ON COLUMN core.venue_facility.quantity IS 'Number of this facility available at the venue';
COMMENT ON COLUMN core.venue_facility.notes IS 'Additional details about the facility at this venue';
