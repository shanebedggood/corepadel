-- Database Initialization Script
-- This script creates the corepadel user and database
-- This runs as the default PostgreSQL superuser

-- Create the corepadel user with password (if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'corepadel') THEN
        CREATE USER corepadel WITH PASSWORD 'corepadel123';
    END IF;
END
$$;

-- Create the corepadel database (if it doesn't exist)
SELECT 'CREATE DATABASE corepadel OWNER corepadel'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'corepadel')\gexec

-- Grant all privileges on the database to corepadel
GRANT ALL PRIVILEGES ON DATABASE corepadel TO corepadel;
