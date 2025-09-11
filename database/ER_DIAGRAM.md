# Core Padel Database - Entity Relationship Diagram

This document contains the complete Entity Relationship (ER) Diagram for the Core Padel application database, showing all 23 tables and their relationships in the `core` schema.

## Database Schema Overview

The database is organized into several logical groups:
- **Venue Management**: Venues, addresses, facilities, and venue types
- **Tournament Management**: Tournaments, teams, matches, participants, and standings
- **User Management**: Users, clubs, roles, and memberships
- **Rules System**: Padel rules and rule sections

## ER Diagram (Mermaid)

```mermaid
erDiagram
    %% Venue Management Tables
    ADDRESS {
        uuid address_id PK
        varchar street
        varchar suburb
        varchar city
        varchar province
        varchar postal_code
        varchar country
    }
    
    VENUE {
        uuid venue_id PK
        varchar name
        varchar website
        uuid address_id FK
    }
    
    VENUE_TYPE {
        uuid venue_type_id PK
        varchar name
        text description
    }
    
    FACILITY {
        uuid facility_id PK
        varchar name
        text description
        varchar icon
        varchar category
        boolean is_countable
        varchar unit
        timestamp created_at
        timestamp updated_at
    }
    
    VENUE_FACILITY {
        uuid venue_id PK,FK
        uuid facility_id PK,FK
        integer quantity
        text notes
        timestamp created_at
    }
    
    %% Tournament Management Tables
    TOURNAMENT {
        uuid tournament_id PK
        varchar tournament_type
        varchar name
        text description
        timestamp start_date
        timestamp end_date
        timestamp registration_start_date
        timestamp registration_end_date
        integer max_participants
        integer current_participants
        numeric entry_fee
        varchar club_id
        varchar firebase_uid
        uuid format_id FK
        uuid category_id FK
        uuid registration_type_id FK
        uuid status_id FK
        uuid venue_type_id FK
        varchar venue_id
        integer no_of_groups
        uuid progression_type_id FK
        integer teams_to_advance
        integer max_players_per_team
        integer rotation_interval
        integer points_to_win
        integer games_per_rotation
    }
    
    TOURNAMENT_STATUS {
        uuid status_id PK
        varchar name
        text description
        varchar color
        varchar text_color
    }
    
    TOURNAMENT_CATEGORY {
        uuid category_id PK
        varchar name
        text description
    }
    
    TOURNAMENT_FORMAT {
        uuid format_id PK
        varchar name
        text description
        varchar category
        integer max_participants
        integer min_participants
        jsonb rules
    }
    
    REGISTRATION_TYPE {
        uuid registration_type_id PK
        varchar name
        text description
    }
    
    PROGRESSION_TYPE {
        uuid progression_type_id PK
        varchar name
        text description
    }
    
    TOURNAMENT_GROUP {
        uuid group_id PK
        uuid tournament_id FK
        varchar name
        integer max_teams
        integer current_teams
        varchar venue_id
    }
    
    TOURNAMENT_TEAM {
        uuid team_id PK
        uuid tournament_id FK
        uuid group_id FK
        varchar name
        varchar player1_firebase_uid
        varchar player2_firebase_uid
        integer combined_rating
    }
    
    TOURNAMENT_MATCH {
        uuid match_id PK
        uuid tournament_id FK
        uuid group_id FK
        varchar phase
        integer round
        uuid team1_id FK
        uuid team2_id FK
        integer team1_score
        integer team2_score
        integer team1_set1
        integer team2_set1
        integer team1_set2
        integer team2_set2
        integer team1_set3
        integer team2_set3
        uuid winner_id FK
        varchar status
        timestamp scheduled_time
        varchar venue_id
    }
    
    TOURNAMENT_PARTICIPANT {
        uuid participant_id PK
        uuid tournament_id FK
        varchar firebase_uid
        varchar added_by
    }
    
    TOURNAMENT_STANDINGS {
        uuid standing_id PK
        varchar tournament_id
        varchar group_id
        varchar team_id
        integer matches_played
        integer matches_won
        integer matches_lost
        integer matches_drawn
        integer goals_for
        integer goals_against
        integer goal_difference
        integer points
        integer position
        timestamp created_at
        timestamp updated_at
    }
    
    %% User Management Tables
    USER {
        varchar firebase_uid PK
        varchar email
        varchar username
        varchar first_name
        varchar last_name
        varchar display_name
        varchar mobile
        integer rating
        varchar profile_picture
        boolean email_verified
        array interests
        boolean profile_completed
    }
    
    CLUB {
        uuid club_id PK
        varchar name
        varchar website
    }
    
    USER_CLUB {
        uuid membership_id PK
        varchar firebase_uid FK
        uuid club_id FK
        varchar role
    }
    
    ROLE {
        uuid role_id PK
        varchar role_name
    }
    
    USER_ROLE {
        uuid role_id FK
        varchar firebase_uid FK
        uuid user_role_id PK
    }
    
    %% Rules System Tables
    RULE {
        uuid rule_id PK
        varchar title
        integer order_number
    }
    
    RULE_SECTION {
        uuid section_id PK
        uuid rule_id FK
        integer section_order
        varchar section_title
        text content
    }
    
    %% Relationships
    ADDRESS ||--o{ VENUE : "has"
    VENUE ||--o{ VENUE_FACILITY : "has"
    FACILITY ||--o{ VENUE_FACILITY : "belongs_to"
    VENUE_TYPE ||--o{ TOURNAMENT : "specifies"
    
    TOURNAMENT ||--o{ TOURNAMENT_GROUP : "contains"
    TOURNAMENT ||--o{ TOURNAMENT_TEAM : "has"
    TOURNAMENT ||--o{ TOURNAMENT_MATCH : "includes"
    TOURNAMENT ||--o{ TOURNAMENT_PARTICIPANT : "includes"
    TOURNAMENT ||--o{ TOURNAMENT_STANDINGS : "tracks"
    
    TOURNAMENT_STATUS ||--o{ TOURNAMENT : "defines"
    TOURNAMENT_CATEGORY ||--o{ TOURNAMENT : "categorizes"
    TOURNAMENT_FORMAT ||--o{ TOURNAMENT : "specifies"
    REGISTRATION_TYPE ||--o{ TOURNAMENT : "defines"
    PROGRESSION_TYPE ||--o{ TOURNAMENT : "specifies"
    
    TOURNAMENT_GROUP ||--o{ TOURNAMENT_TEAM : "contains"
    TOURNAMENT_GROUP ||--o{ TOURNAMENT_MATCH : "organizes"
    
    TOURNAMENT_TEAM ||--o{ TOURNAMENT_MATCH : "plays_in"
    TOURNAMENT_TEAM ||--o{ TOURNAMENT_STANDINGS : "ranked_in"
    
    USER ||--o{ USER_CLUB : "member_of"
    USER ||--o{ USER_ROLE : "has"
    USER ||--o{ TOURNAMENT_PARTICIPANT : "participates_in"
    USER ||--o{ TOURNAMENT_TEAM : "plays_for"
    
    CLUB ||--o{ USER_CLUB : "has_members"
    CLUB ||--o{ TOURNAMENT : "hosts"
    
    ROLE ||--o{ USER_ROLE : "assigned_to"
    
    RULE ||--o{ RULE_SECTION : "contains"
```

## Table Descriptions

### Venue Management (5 tables)
- **ADDRESS**: Stores physical address information for venues
- **VENUE**: Represents padel clubs/venues with their basic information
- **VENUE_TYPE**: Defines types of venues (single, multiple, etc.)
- **FACILITY**: Individual facilities that can be associated with venues
- **VENUE_FACILITY**: Junction table linking venues to facilities with quantities

### Tournament Management (11 tables)
- **TOURNAMENT**: Main tournament entity with all configuration options
- **TOURNAMENT_STATUS**: Tournament lifecycle statuses (draft, active, completed, etc.)
- **TOURNAMENT_CATEGORY**: Tournament categories (men's, women's, mixed)
- **TOURNAMENT_FORMAT**: Tournament formats (round-robin, single elimination, etc.)
- **REGISTRATION_TYPE**: How players register (individual, team, solo)
- **PROGRESSION_TYPE**: How players advance through the tournament
- **TOURNAMENT_GROUP**: Groups within tournaments for organization
- **TOURNAMENT_TEAM**: Teams participating in tournaments
- **TOURNAMENT_MATCH**: Individual matches between teams
- **TOURNAMENT_PARTICIPANT**: Players registered for tournaments
- **TOURNAMENT_STANDINGS**: Current rankings and statistics

### User Management (5 tables)
- **USER**: User profiles with Firebase authentication
- **CLUB**: Padel clubs that users can join
- **USER_CLUB**: Membership relationships between users and clubs
- **ROLE**: System roles for users
- **USER_ROLE**: Role assignments for users

### Rules System (2 tables)
- **RULE**: Padel rules with titles and ordering (29 rules including Basic Padel Rules, Scoring System, Court Dimensions)
- **RULE_SECTION**: Individual rule sections with content (16 sections for the new consolidated rules)

## Key Relationships

1. **Venues** are linked to **Addresses** (one-to-one)
2. **Venues** can have multiple **Facilities** through the **VENUE_FACILITY** junction table
3. **Tournaments** reference multiple lookup tables for configuration
4. **Tournaments** contain **Groups**, **Teams**, and **Matches**
5. **Users** can belong to multiple **Clubs** and have multiple **Roles**
6. **Rules** contain multiple **Rule Sections**

## Current Data Status

- **Total Tables**: 23 tables in the `core` schema
- **Rules**: 29 padel rules with proper structure
- **Rule Sections**: 16 sections for the consolidated rules (Basic Padel Rules: 6 sections, Scoring System: 5 sections, Court Dimensions: 5 sections)
- **All tables** are now properly consolidated in the `core` schema

## Notes

- The database uses UUID primary keys for most tables
- Firebase UID is used for user authentication
- Timestamps are used for audit trails
- The design supports both individual and team tournaments
- Facilities are normalized to support different venue configurations
- **All rules tables are now properly consolidated in the `core` schema** - no more duplicates in `public` schema
