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
)

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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tournament_club_id ON core.tournament(club_id);
CREATE INDEX IF NOT EXISTS idx_tournament_user_id ON core.tournament(user_id);
