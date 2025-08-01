CREATE TABLE IF NOT EXISTS core.club (
    club_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    website VARCHAR(255)
);

-- Index on venue name for quick lookups
CREATE INDEX IF NOT EXISTS idx_club_name ON core.club (name);