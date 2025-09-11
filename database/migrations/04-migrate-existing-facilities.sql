-- Data Migration Script: Migrate Existing Facilities
-- This script parses existing comma-separated facilities and creates proper relationships

-- Connect to the corepadel database
\c corepadel;

-- Set search path to include core schema
SET search_path TO core, public;

-- Step 1: Create a temporary function to parse facilities
CREATE OR REPLACE FUNCTION parse_facilities_string(facilities_text TEXT)
RETURNS TABLE(facility_name TEXT, quantity INTEGER) AS $$
DECLARE
    facility_item TEXT;
    parts TEXT[];
    facility_name TEXT;
    quantity INTEGER;
BEGIN
    -- Handle null or empty facilities
    IF facilities_text IS NULL OR TRIM(facilities_text) = '' THEN
        RETURN;
    END IF;
    
    -- Split by comma and process each facility
    FOREACH facility_item IN ARRAY string_to_array(facilities_text, ',')
    LOOP
        facility_item := TRIM(facility_item);
        
        -- Skip empty items
        IF facility_item = '' THEN
            CONTINUE;
        END IF;
        
        -- Try to extract quantity from facility name
        -- Look for patterns like "3 Indoor Courts", "2 Outdoor Courts", etc.
        parts := string_to_array(facility_item, ' ');
        
        -- Check if first part is a number
        BEGIN
            quantity := parts[1]::INTEGER;
            -- Reconstruct facility name without the number
            facility_name := array_to_string(parts[2:array_length(parts, 1)], ' ');
        EXCEPTION
            WHEN OTHERS THEN
                -- No number found, assume quantity = 1
                quantity := 1;
                facility_name := facility_item;
        END;
        
        -- Clean up facility name
        facility_name := TRIM(facility_name);
        
        -- Return the parsed facility
        RETURN QUERY SELECT facility_name, quantity;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Step 2: Create a function to migrate facilities for a specific venue
CREATE OR REPLACE FUNCTION migrate_venue_facilities(venue_uuid UUID, facilities_text TEXT)
RETURNS VOID AS $$
DECLARE
    facility_record RECORD;
    new_facility_id UUID;
    existing_facility_id UUID;
BEGIN
    -- Parse the facilities string
    FOR facility_record IN SELECT * FROM parse_facilities_string(facilities_text)
    LOOP
        -- Check if facility already exists
        SELECT facility_id INTO existing_facility_id 
        FROM core.facility 
        WHERE LOWER(name) = LOWER(facility_record.facility_name);
        
        IF existing_facility_id IS NULL THEN
            -- Create new facility
            INSERT INTO core.facility (name, category, is_countable, unit)
            VALUES (
                facility_record.facility_name,
                CASE 
                    WHEN LOWER(facility_record.facility_name) LIKE '%court%' THEN 'Court'
                    WHEN LOWER(facility_record.facility_name) LIKE '%shop%' THEN 'Amenity'
                    WHEN LOWER(facility_record.facility_name) LIKE '%café%' OR LOWER(facility_record.facility_name) LIKE '%cafe%' THEN 'Amenity'
                    WHEN LOWER(facility_record.facility_name) LIKE '%parking%' THEN 'Amenity'
                    WHEN LOWER(facility_record.facility_name) LIKE '%coaching%' THEN 'Service'
                    ELSE 'Amenity'
                END,
                CASE 
                    WHEN LOWER(facility_record.facility_name) LIKE '%court%' THEN TRUE
                    WHEN LOWER(facility_record.facility_name) LIKE '%parking%' THEN TRUE
                    ELSE FALSE
                END,
                CASE 
                    WHEN LOWER(facility_record.facility_name) LIKE '%court%' THEN 'courts'
                    WHEN LOWER(facility_record.facility_name) LIKE '%parking%' THEN 'spaces'
                    ELSE NULL
                END
            )
            RETURNING facility_id INTO new_facility_id;
        ELSE
            new_facility_id := existing_facility_id;
        END IF;
        
        -- Create venue-facility relationship
        INSERT INTO core.venue_facility (venue_id, facility_id, quantity)
        VALUES (venue_uuid, new_facility_id, facility_record.quantity)
        ON CONFLICT (venue_id, facility_id) DO UPDATE SET
            quantity = EXCLUDED.quantity;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Migrate all existing venues with facilities
-- This will process all venues that currently have facilities data
DO $$
DECLARE
    venue_record RECORD;
    facilities_text TEXT;
BEGIN
    -- Loop through all venues that have facilities data
    FOR venue_record IN 
        SELECT venue_id, facilities 
        FROM core.venue 
        WHERE facilities IS NOT NULL AND TRIM(facilities) != ''
    LOOP
        RAISE NOTICE 'Migrating facilities for venue: %', venue_record.venue_id;
        
        -- Migrate facilities for this venue
        PERFORM migrate_venue_facilities(venue_record.venue_id, venue_record.facilities);
    END LOOP;
    
    RAISE NOTICE 'Facilities migration completed';
END $$;

-- Step 4: Clean up temporary functions
DROP FUNCTION IF EXISTS parse_facilities_string(TEXT);
DROP FUNCTION IF EXISTS migrate_venue_facilities(UUID, TEXT);

-- Step 5: Verify migration results
SELECT 
    v.name as venue_name,
    f.name as facility_name,
    vf.quantity,
    f.category,
    f.is_countable
FROM core.venue v
JOIN core.venue_facility vf ON v.venue_id = vf.venue_id
JOIN core.facility f ON vf.facility_id = f.facility_id
ORDER BY v.name, f.category, f.name;

-- Step 6: Show summary statistics
SELECT 
    COUNT(DISTINCT v.venue_id) as total_venues,
    COUNT(DISTINCT f.facility_id) as total_facilities,
    COUNT(vf.venue_id) as total_venue_facility_relationships
FROM core.venue v
LEFT JOIN core.venue_facility vf ON v.venue_id = vf.venue_id
LEFT JOIN core.facility f ON vf.facility_id = f.facility_id;
