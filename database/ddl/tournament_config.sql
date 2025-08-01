-- Table for Tournament Categories (e.g., Men's, Women's, Mixed)
CREATE TABLE IF NOT EXISTS core.category (
    category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT
);

-- Table for Tournament Formats (e.g., Single Elimination, Round Robin)
CREATE TABLE IF NOT EXISTS core.format (
    format_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    category VARCHAR(50),
    max_participants INTEGER,
    min_participants INTEGER,
    rules JSONB
);

-- Table for Progression Types (e.g., Top N Advance, Swiss System)
CREATE TABLE IF NOT EXISTS core.progression_type (
    progression_type_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT
);

-- Table for Registration Types (e.g., Individual, Team, Solo)
CREATE TABLE IF NOT EXISTS core.registration_type (
    registration_type_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT
);

-- Table for Tournament Statuses (e.g., Draft, Registration Open, Active, Completed, Cancelled)
-- Based on your previous data, adding color/text_color fields
CREATE TABLE IF NOT EXISTS core.tournament_status (
    status_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7),
    text_color VARCHAR(7)
);

-- Table for Venue Types (e.g., Indoor Padel Court, Outdoor Padel Court)
CREATE TABLE IF NOT EXISTS core.venue_type (
    venue_type_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT
);

-- Table for Advancement Models (e.g., Trophy/Plate, Elimination Only)
CREATE TABLE IF NOT EXISTS core.advancement_model (
    advancement_model_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT
);

-- Table for Elimination Bracket Sizes (e.g., Final, Semi-finals, Quarter-finals)
CREATE TABLE IF NOT EXISTS core.elimination_bracket_size (
    bracket_size_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    teams INTEGER NOT NULL
);

-- Table for Teams to Advance (for combined elimination settings)
CREATE TABLE IF NOT EXISTS core.teams_to_advance (
    teams_advance_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    team_count INTEGER NOT NULL
);
