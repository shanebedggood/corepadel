# Tournament Object Hierarchy

## Overview

The tournament system has been refactored to use an object hierarchy pattern, allowing different tournament formats to have their own specific fields and behavior while sharing common functionality.

## Architecture

### Abstract Base Class: `Tournament`

The `Tournament` class is now abstract and contains all common fields shared by all tournament types:

**Common Fields:**
- `tournamentId` - Unique identifier
- `name` - Tournament name
- `description` - Tournament description
- `startDate` - Tournament start date
- `endDate` - Tournament end date
- `registrationStartDate` - Registration start date
- `registrationEndDate` - Registration end date
- `maxParticipants` - Maximum number of participants
- `currentParticipants` - Current number of participants
- `entryFee` - Entry fee amount
- `clubId` - Associated club ID
- `userId` - Creator user ID
- `venueId` - Associated venue ID

**Common Relationships:**
- `format` - Tournament format (Format entity)
- `category` - Tournament category (Category entity)
- `registrationType` - Registration type (RegistrationType entity)
- `status` - Tournament status (TournamentStatus entity)
- `venueType` - Venue type (VenueType entity)

**Abstract Method:**
- `getTournamentType()` - Must be implemented by subclasses

### Concrete Classes

#### 1. `RoundRobinTournament`

Extends `Tournament` and adds Round Robin specific fields:

**Additional Fields:**
- `noOfGroups` - Number of groups in the tournament
- `progressionType` - How teams progress (ProgressionType entity)
- `advancementModel` - Advancement model (AdvancementModel entity)
- `eliminationBracketSize` - Elimination bracket size (EliminationBracketSize entity)
- `teamsToAdvance` - Teams to advance (TeamsToAdvance entity)

**Tournament Type:** `ROUND_ROBIN`

#### 2. `AmericanoTournament`

Extends `Tournament` and adds Americano specific fields:

**Additional Fields:**
- `maxPlayersPerTeam` - Maximum players per team (default: 4)
- `rotationInterval` - Minutes between rotations (default: 15)
- `pointsToWin` - Points needed to win a game (default: 11)
- `gamesPerRotation` - Games played before rotation (default: 1)

**Tournament Type:** `AMERICANO`

## Database Schema

The database uses a single table inheritance strategy with a discriminator column:

```sql
CREATE TABLE core.tournament (
    tournament_id UUID PRIMARY KEY,
    tournament_type VARCHAR(50) NOT NULL DEFAULT 'ROUND_ROBIN', -- Discriminator
    -- Common fields
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    -- ... other common fields
    
    -- Round Robin specific fields
    no_of_groups INTEGER,
    progression_type_id UUID,
    advancement_model_id UUID,
    elimination_bracket_size_id UUID,
    teams_to_advance_id UUID,
    
    -- Americano specific fields
    max_players_per_team INTEGER DEFAULT 4,
    rotation_interval INTEGER DEFAULT 15,
    points_to_win INTEGER DEFAULT 11,
    games_per_rotation INTEGER DEFAULT 1
);
```

## DTOs (Data Transfer Objects)

### Abstract Base DTO: `TournamentDto`

Contains all common fields and relationships.

### Concrete DTOs

#### `RoundRobinTournamentDto`
Extends `TournamentDto` and adds Round Robin specific fields.

#### `AmericanoTournamentDto`
Extends `TournamentDto` and adds Americano specific fields.

## Service Layer

The `TournamentService` has been updated to handle the hierarchy:

### Conversion Methods

- `convertToDto(Tournament)` - Converts entity to appropriate DTO based on type
- `convertToEntity(TournamentDto)` - Converts DTO to appropriate entity based on type
- `convertRoundRobinToDto(RoundRobinTournament)` - Converts Round Robin entity to DTO
- `convertAmericanoToDto(AmericanoTournament)` - Converts Americano entity to DTO
- `convertToRoundRobinEntity(RoundRobinTournamentDto)` - Converts Round Robin DTO to entity
- `convertToAmericanoEntity(AmericanoTournamentDto)` - Converts Americano DTO to entity

### Update Methods

- `updateEntityFromDto(Tournament, TournamentDto)` - Updates entity from DTO
- `updateRoundRobinFromDto(RoundRobinTournament, RoundRobinTournamentDto)` - Updates Round Robin specific fields
- `updateAmericanoFromDto(AmericanoTournament, AmericanoTournamentDto)` - Updates Americano specific fields

## Frontend Integration

### TypeScript Interfaces

The frontend has been updated with corresponding TypeScript interfaces:

```typescript
// Base interface
interface Tournament {
    // Common fields
    tournamentType: string;
}

// Round Robin specific interface
interface RoundRobinTournament extends Tournament {
    tournamentType: 'ROUND_ROBIN';
    noOfGroups?: number;
    progressionOption?: TournamentProgressionOption;
    advancementModel?: any;
    eliminationBracketSize?: any;
}

// Americano specific interface
interface AmericanoTournament extends Tournament {
    tournamentType: 'AMERICANO';
    maxPlayersPerTeam?: number;
    rotationInterval?: number;
    pointsToWin?: number;
    gamesPerRotation?: number;
}
```

## Migration

A migration script has been created to update existing databases:

1. Adds the `tournament_type` discriminator column
2. Adds Americano-specific columns
3. Updates existing tournaments to have the correct type based on their format
4. Creates indexes for better performance

## Benefits

1. **Extensibility** - Easy to add new tournament types
2. **Type Safety** - Compile-time checking for tournament-specific fields
3. **Maintainability** - Clear separation of concerns
4. **Backward Compatibility** - Existing tournaments continue to work
5. **Flexibility** - Each tournament type can have its own behavior

## Future Tournament Types

To add a new tournament type:

1. Create a new entity class extending `Tournament`
2. Create a corresponding DTO extending `TournamentDto`
3. Add the new fields to the database schema
4. Update the service layer with conversion methods
5. Update the frontend interfaces
6. Add UI components for the new tournament type

Example for a future "Swiss System" tournament:

```java
@Entity
@DiscriminatorValue("SWISS")
public class SwissTournament extends Tournament {
    private Integer rounds;
    private Integer pointsPerWin;
    // ... other Swiss-specific fields
}
```
