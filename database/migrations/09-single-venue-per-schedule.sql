-- Single Venue Per Schedule Migration
-- This script adds constraints to ensure each schedule has only one venue

-- Connect to the corepadel database
\c corepadel;

-- Set search path to include core schema
SET search_path TO core, public;

-- Add a function to check that all days in a schedule have the same venue
CREATE OR REPLACE FUNCTION check_single_venue_per_schedule()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if there are any other venues in the same schedule
    IF EXISTS (
        SELECT 1 
        FROM core.court_schedule_days 
        WHERE schedule_id = NEW.schedule_id 
        AND venue_id != NEW.venue_id
    ) THEN
        RAISE EXCEPTION 'All days in a schedule must have the same venue';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce single venue per schedule
DROP TRIGGER IF EXISTS trigger_single_venue_per_schedule ON core.court_schedule_days;
CREATE TRIGGER trigger_single_venue_per_schedule
    BEFORE INSERT OR UPDATE ON core.court_schedule_days
    FOR EACH ROW
    EXECUTE FUNCTION check_single_venue_per_schedule();

-- Add comment for documentation
COMMENT ON FUNCTION check_single_venue_per_schedule() IS 'Ensures that all days in a court schedule belong to the same venue';
