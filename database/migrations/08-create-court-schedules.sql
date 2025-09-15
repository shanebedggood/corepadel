-- Court Schedules Migration
-- This script creates the court_schedules and court_bookings tables for court scheduling functionality

-- Connect to the corepadel database
\c corepadel;

-- Set search path to include core schema
SET search_path TO core, public;

-- Create court_schedules table
CREATE TABLE IF NOT EXISTS core.court_schedules (
    schedule_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL REFERENCES core.club(club_id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure start_date is before end_date
    CONSTRAINT chk_court_schedules_date_range CHECK (start_date <= end_date)
);

-- Create court_schedule_days table (for individual day configurations)
CREATE TABLE IF NOT EXISTS core.court_schedule_days (
    schedule_day_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id UUID NOT NULL REFERENCES core.court_schedules(schedule_id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 1=Monday, ..., 6=Saturday
    venue_id UUID NOT NULL REFERENCES core.club(club_id) ON DELETE CASCADE,
    time_slot TIME NOT NULL, -- Format: HH:MM
    game_duration INTEGER NOT NULL CHECK (game_duration IN (60, 90, 120)), -- Duration in minutes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure unique combination of schedule, day, venue, and time
    UNIQUE(schedule_id, day_of_week, venue_id, time_slot)
);

-- Create court_bookings table (for player bookings)
CREATE TABLE IF NOT EXISTS core.court_bookings (
    booking_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id UUID NOT NULL REFERENCES core.court_schedules(schedule_id) ON DELETE CASCADE,
    firebase_uid VARCHAR(255) NOT NULL REFERENCES core.user(firebase_uid) ON DELETE CASCADE,
    booking_date DATE NOT NULL, -- YYYY-MM-DD format
    time_slot TIME NOT NULL, -- HH:MM format
    game_duration INTEGER NOT NULL CHECK (game_duration IN (60, 90, 120)),
    venue_id UUID NOT NULL REFERENCES core.club(club_id) ON DELETE CASCADE,
    court_number INTEGER, -- Optional court number if multiple courts available
    status VARCHAR(20) NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure unique booking for same date, time, venue, and court
    UNIQUE(booking_date, time_slot, venue_id, court_number)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_court_schedules_club_id ON core.court_schedules(club_id);
CREATE INDEX IF NOT EXISTS idx_court_schedules_date_range ON core.court_schedules(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_court_schedule_days_schedule_id ON core.court_schedule_days(schedule_id);
CREATE INDEX IF NOT EXISTS idx_court_schedule_days_day_venue ON core.court_schedule_days(day_of_week, venue_id);
CREATE INDEX IF NOT EXISTS idx_court_schedule_days_venue_time ON core.court_schedule_days(venue_id, time_slot);

CREATE INDEX IF NOT EXISTS idx_court_bookings_schedule_id ON core.court_bookings(schedule_id);
CREATE INDEX IF NOT EXISTS idx_court_bookings_user_id ON core.court_bookings(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_court_bookings_date_venue ON core.court_bookings(booking_date, venue_id);
CREATE INDEX IF NOT EXISTS idx_court_bookings_status ON core.court_bookings(status);

-- Add comments for documentation
COMMENT ON TABLE core.court_schedules IS 'Main table for court scheduling configurations';
COMMENT ON TABLE core.court_schedule_days IS 'Individual day configurations for court schedules (day of week, venue, time, duration)';
COMMENT ON TABLE core.court_bookings IS 'Player bookings for specific court time slots';

COMMENT ON COLUMN core.court_schedule_days.day_of_week IS 'Day of week: 0=Sunday, 1=Monday, ..., 6=Saturday';
COMMENT ON COLUMN core.court_schedule_days.time_slot IS 'Time slot in HH:MM format (24-hour)';
COMMENT ON COLUMN core.court_schedule_days.game_duration IS 'Game duration in minutes: 60, 90, or 120';

COMMENT ON COLUMN core.court_bookings.booking_date IS 'Date of the booking in YYYY-MM-DD format';
COMMENT ON COLUMN core.court_bookings.time_slot IS 'Time slot in HH:MM format (24-hour)';
COMMENT ON COLUMN core.court_bookings.game_duration IS 'Game duration in minutes: 60, 90, or 120';
COMMENT ON COLUMN core.court_bookings.court_number IS 'Optional court number if venue has multiple courts';
COMMENT ON COLUMN core.court_bookings.status IS 'Booking status: confirmed, cancelled, or completed';

-- Grant permissions to corepadel user
GRANT ALL PRIVILEGES ON TABLE core.court_schedules TO corepadel;
GRANT ALL PRIVILEGES ON TABLE core.court_schedule_days TO corepadel;
GRANT ALL PRIVILEGES ON TABLE core.court_bookings TO corepadel;

-- Grant sequence permissions (for UUID generation)
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA core TO corepadel;
