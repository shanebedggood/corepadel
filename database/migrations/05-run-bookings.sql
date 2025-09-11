-- Run Bookings Migration
-- Creates the run_bookings table for 5AM run scheduling

-- Connect to the corepadel database
\c corepadel;

-- Set search path to include core schema
SET search_path TO core, public;

-- Create run_bookings table
CREATE TABLE IF NOT EXISTS core.run_booking (
    booking_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firebase_uid VARCHAR(255) NOT NULL REFERENCES core.user(firebase_uid) ON DELETE CASCADE,
    user_name VARCHAR(255) NOT NULL,
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL DEFAULT '05:00:00',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure one booking per user per date
    UNIQUE(firebase_uid, booking_date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_run_booking_date ON core.run_booking(booking_date);
CREATE INDEX IF NOT EXISTS idx_run_booking_user ON core.run_booking(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_run_booking_created ON core.run_booking(created_at);

-- Create a composite index for date range queries
CREATE INDEX IF NOT EXISTS idx_run_booking_date_user ON core.run_booking(booking_date, firebase_uid);

-- Grant permissions to corepadel user
GRANT ALL PRIVILEGES ON TABLE core.run_booking TO corepadel;

-- Add comments for documentation
COMMENT ON TABLE core.run_booking IS 'Stores 5AM run bookings for users';
COMMENT ON COLUMN core.run_booking.booking_id IS 'Unique identifier for the booking';
COMMENT ON COLUMN core.run_booking.firebase_uid IS 'Reference to the user who made the booking';
COMMENT ON COLUMN core.run_booking.user_name IS 'Display name of the user at time of booking';
COMMENT ON COLUMN core.run_booking.booking_date IS 'Date of the run (YYYY-MM-DD)';
COMMENT ON COLUMN core.run_booking.booking_time IS 'Time of the run (always 05:00:00)';
COMMENT ON COLUMN core.run_booking.created_at IS 'When the booking was created';
COMMENT ON COLUMN core.run_booking.updated_at IS 'When the booking was last updated';
