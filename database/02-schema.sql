-- Schema Initialization Script
-- This script creates the database schema and tables

-- Connect to the corepadel database
\c corepadel;

-- Create the core schema
CREATE SCHEMA IF NOT EXISTS core;

-- Set search path to include core schema
SET search_path TO core, public;

-- Create user table
CREATE TABLE IF NOT EXISTS "user" (
    firebase_uid VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(255) NOT NULL UNIQUE,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    display_name VARCHAR(255),
    mobile VARCHAR(50),
    rating INTEGER DEFAULT 0,
    profile_picture TEXT,
    email_verified BOOLEAN DEFAULT FALSE,
    interests TEXT[],
    profile_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_email ON "user"(email);
CREATE INDEX IF NOT EXISTS idx_user_username ON "user"(username);
CREATE INDEX IF NOT EXISTS idx_user_rating ON "user"(rating);

-- Grant permissions to corepadel user
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA core TO corepadel;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA core TO corepadel;
GRANT USAGE ON SCHEMA core TO corepadel;
