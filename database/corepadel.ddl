CREATE DATABASE corepadel IF NOT EXISTS
    WITH
    OWNER = keycloak
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.utf8'
    LC_CTYPE = 'en_US.utf8'
    LOCALE_PROVIDER = 'libc'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1
    IS_TEMPLATE = False;

-- Create the 'core' schema
CREATE SCHEMA core IF NOT EXISTS;

-- Club table
CREATE TABLE IF NOT EXISTS core.club (
    club_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    website VARCHAR(255)
);
CREATE INDEX IF NOT EXISTS idx_club_name ON core.club (name);

-- User table
CREATE TABLE IF NOT EXISTS core.user (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firebase_uid VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(255) NOT NULL UNIQUE,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    display_name VARCHAR(255),
    mobile VARCHAR(50),
    rating INTEGER DEFAULT 0,
    profile_picture VARCHAR(500),
    email_verified BOOLEAN DEFAULT false
);

-- User roles table to store user roles
CREATE TABLE IF NOT EXISTS core.user_role (
    role_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES core.user(user_id) ON DELETE CASCADE,
    role_name VARCHAR(100) NOT NULL, -- 'player', 'admin', etc.
    
    UNIQUE(user_id, role_name)
);

-- User club membership table
CREATE TABLE IF NOT EXISTS core.user_club (
    membership_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES core.user(user_id) ON DELETE CASCADE,
    club_id UUID NOT NULL REFERENCES core.club(club_id) ON DELETE CASCADE,
    role VARCHAR(100) DEFAULT 'member', -- 'member', 'admin', 'owner'
    
    UNIQUE(user_id, club_id)
);

-- Roles lookup table (seeded)
CREATE TABLE IF NOT EXISTS core.role (
    role_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_name VARCHAR(100) NOT NULL UNIQUE
);

--Padel rules table (seeded)
CREATE TABLE IF NOT EXISTS core.rule (
    rule_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL UNIQUE,
    order_number INTEGER,
	rule_description TEXT
);
CREATE INDEX IF NOT EXISTS idx_order_number ON core.rule (order_number);

-- Address table
CREATE TABLE IF NOT EXISTS core.address (
    address_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    street VARCHAR(255) NOT NULL,
    suburb VARCHAR(255),
    city VARCHAR(255) NOT NULL,
    province VARCHAR(255),
    postal_code VARCHAR(20),
    country VARCHAR(255) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_address_city ON core.address (city);
CREATE INDEX IF NOT EXISTS idx_address_province ON core.address (province);

-- Venue table (seeded)
CREATE TABLE IF NOT EXISTS core.venue (
    venue_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    website VARCHAR(255),
	facilities VARCHAR(255),		   
    address_id UUID NOT NULL,

    -- Define the foreign key constraint
    CONSTRAINT fk_address
        FOREIGN KEY (address_id)
        REFERENCES core.address (address_id)
        ON DELETE RESTRICT 
);
CREATE INDEX IF NOT EXISTS idx_venue_name ON core.venue (name);

-- Table for Tournament Categories (e.g., Men's, Women's, Mixed) (seeded)
CREATE TABLE IF NOT EXISTS core.category (
    category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT
);

-- Table for Tournament Formats (e.g., Single Elimination, Round Robin) (seeded)
CREATE TABLE IF NOT EXISTS core.format (
    format_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    category VARCHAR(50),
    max_participants INTEGER,
    min_participants INTEGER,
    rules JSONB
);

-- Table for Progression Types (e.g., Top N Advance, Swiss System) (seeded)
CREATE TABLE IF NOT EXISTS core.progression_type (
    progression_type_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT
);

-- Table for Registration Types (e.g., Individual, Team, Solo) (seeded)
CREATE TABLE IF NOT EXISTS core.registration_type (
    registration_type_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT
);

-- Table for Tournament Statuses (e.g., Draft, Registration Open, Active, Completed, Cancelled) (seeded)
CREATE TABLE IF NOT EXISTS core.tournament_status (
    status_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7),
    text_color VARCHAR(7)
);

-- Table for Advancement Models (e.g., Trophy/Plate, Elimination Only) (seeded)
CREATE TABLE IF NOT EXISTS core.advancement_model (
    advancement_model_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT
);

-- Table for Elimination Bracket Sizes (e.g., Final, Semi-finals, Quarter-finals) (seeded)
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

-- Venue type table - single or multiple (seeded)
create table core.venue_type
(
    venue_type_id uuid default gen_random_uuid() not null primary key,
    name varchar(255) not null unique,
    description   text
);

-- Tournament main table
CREATE TABLE IF NOT EXISTS core.tournament (
    tournament_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    registration_start_date TIMESTAMP,
    registration_end_date TIMESTAMP,
    max_participants INTEGER NOT NULL,
    current_participants INTEGER DEFAULT 0,
    entry_fee DECIMAL(10,2) DEFAULT 0.00,
    no_of_groups INTEGER,
    club_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,

    -- Foreign keys
    format_id UUID REFERENCES core.format(format_id),
    category_id UUID REFERENCES core.category(category_id),
    registration_type_id UUID REFERENCES core.registration_type(registration_type_id),
    status_id UUID REFERENCES core.tournament_status(status_id),
    venue_type_id UUID REFERENCES core.venue_type(venue_type_id),
    venue_id VARCHAR(255),
    
    -- Round-robin specific fields
    progression_type_id UUID REFERENCES core.progression_type(progression_type_id),
    advancement_model_id UUID REFERENCES core.advancement_model(advancement_model_id),
    elimination_bracket_size_id UUID REFERENCES core.elimination_bracket_size(bracket_size_id),
    teams_to_advance_id UUID REFERENCES core.teams_to_advance(teams_advance_id)
);

-- Tournament participants table
CREATE TABLE IF NOT EXISTS core.tournament_participant
(
    participant_id uuid NOT NULL DEFAULT gen_random_uuid(),
    tournament_id uuid NOT NULL,
    user_id character varying(255) COLLATE pg_catalog."default" NOT NULL,
    added_by character varying(255) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT tournament_participant_pkey PRIMARY KEY (participant_id),
    CONSTRAINT tournament_participant_tournament_id_uid_key UNIQUE (tournament_id, user_id),
    CONSTRAINT tournament_participant_tournament_id_fkey FOREIGN KEY (tournament_id)
        REFERENCES core.tournament (tournament_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);

-- Tournament groups table
CREATE TABLE IF NOT EXISTS core.tournament_group (
    group_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL REFERENCES core.tournament(tournament_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    max_teams INTEGER NOT NULL,
    current_teams INTEGER DEFAULT 0,
    venue_id VARCHAR(255),
    
    UNIQUE(tournament_id, name)
);

-- Tournament teams table
CREATE TABLE IF NOT EXISTS core.tournament_team (
    team_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL REFERENCES core.tournament(tournament_id) ON DELETE CASCADE,
    group_id UUID REFERENCES core.tournament_group(group_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    player1_uid VARCHAR(255) NOT NULL,
    player2_uid VARCHAR(255), -- Can be NULL for teams with only one player
    combined_rating INTEGER,
    
    UNIQUE(tournament_id, name)
);

-- Tournament matches table
CREATE TABLE IF NOT EXISTS core.tournament_match (
    match_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL REFERENCES core.tournament(tournament_id) ON DELETE CASCADE,
    group_id UUID REFERENCES core.tournament_group(group_id) ON DELETE CASCADE,
    phase VARCHAR(50) NOT NULL, -- 'group', 'quarterfinal', 'semifinal', 'final'
    round INTEGER NOT NULL,
    team1_id UUID NOT NULL REFERENCES core.tournament_team(team_id),
    team2_id UUID NOT NULL REFERENCES core.tournament_team(team_id),
    team1_score INTEGER,
    team2_score INTEGER,
    team1_set1 INTEGER,
    team2_set1 INTEGER,
    team1_set2 INTEGER,
    team2_set2 INTEGER,
    team1_set3 INTEGER,
    team2_set3 INTEGER,
    winner_id UUID REFERENCES core.tournament_team(team_id),
    status VARCHAR(50) NOT NULL DEFAULT 'scheduled', -- 'scheduled', 'in_progress', 'completed', 'cancelled'
    scheduled_time TIMESTAMP,
    venue_id VARCHAR(255)
);
CREATE INDEX IF NOT EXISTS idx_tournament_club_id ON core.tournament(club_id);
CREATE INDEX IF NOT EXISTS idx_tournament_user_id ON core.tournament(user_id);

-- Create tournament_standings table if it doesn't exist
CREATE TABLE IF NOT EXISTS core.tournament_standings (
    standing_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id VARCHAR(255) NOT NULL,
    group_id VARCHAR(255) NOT NULL,
    team_id VARCHAR(255) NOT NULL,
    matches_played INTEGER DEFAULT 0,
    matches_won INTEGER DEFAULT 0,
    matches_lost INTEGER DEFAULT 0,
    matches_drawn INTEGER DEFAULT 0,
    goals_for INTEGER DEFAULT 0,
    goals_against INTEGER DEFAULT 0,
    goal_difference INTEGER DEFAULT 0,
    points INTEGER DEFAULT 0,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_tournament_standings_tournament_id ON core.tournament_standings(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_standings_tournament_group ON core.tournament_standings(tournament_id, group_id);
CREATE INDEX IF NOT EXISTS idx_tournament_standings_unique_team ON core.tournament_standings(tournament_id, group_id, team_id);
