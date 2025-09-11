# Club and Venue Entity Merge Guide

## Overview

This document describes the merge of the separate `Club` and `Venue` entities into a unified `Club` entity that can represent different types of organizations.

## Changes Made

### 1. New ClubType Enum
- **File**: `services/src/main/java/za/cf/cp/club/ClubType.java`
- **Purpose**: Defines different organization types (CLUB, VENUE, ACADEMY, LEAGUE)
- **Usage**: Used to differentiate between traditional clubs and venues in the unified entity

### 2. Updated Club Entity
- **File**: `services/src/main/java/za/cf/cp/club/Club.java`
- **Changes**:
  - Added `type` field (ClubType enum)
  - Added `facilities` relationship (List<ClubFacility>)
  - Added `address` relationship (Address)
  - Added helper methods: `isVenue()`, `isClub()`, `isAcademy()`, `isLeague()`
  - Updated constructors to support different organization types

### 3. New ClubFacility Entity
- **File**: `services/src/main/java/za/cf/cp/club/ClubFacility.java`
- **Purpose**: Replaces VenueFacility to work with the unified Club entity
- **Features**: Same functionality as VenueFacility but references Club instead of Venue

### 4. Updated Tournament Entity
- **File**: `services/src/main/java/za/cf/cp/tournament/Tournament.java`
- **Changes**:
  - Replaced `clubId` (String) with `club` (Club entity relationship)
  - Added `venueClub` (Club entity relationship) for hosting venue
  - Updated constructors to use Club entities
  - Added backward compatibility methods: `getClubId()`, `getVenueId()`

### 5. Updated Tournament Subclasses
- **Files**: 
  - `services/src/main/java/za/cf/cp/tournament/RoundRobinTournament.java`
  - `services/src/main/java/za/cf/cp/tournament/AmericanoTournament.java`
- **Changes**: Updated constructors to use Club entity instead of clubId string

### 6. Database Migration Script
- **File**: `database/migrations/06-merge-club-venue.sql`
- **Purpose**: Handles the transition from separate tables to unified structure
- **Features**:
  - Adds new columns to club table
  - Migrates venue data to club table
  - Updates tournament relationships
  - Creates new club_facility table
  - Preserves existing data

## Data Model

### Before (Separate Entities)
```
Club {
  clubId: UUID
  name: String
  website: String
}

Venue {
  venueId: UUID
  name: String
  website: String
  facilities: List<VenueFacility>
  address: Address
}

Tournament {
  clubId: String (references Club)
  venueId: String (references Venue)
}
```

### After (Unified Entity)
```
Club {
  clubId: UUID
  name: String
  website: String
  type: ClubType (CLUB, VENUE, ACADEMY, LEAGUE)
  facilities: List<ClubFacility> (nullable for clubs)
  address: Address (nullable for clubs)
}

Tournament {
  club: Club (owner/creator)
  venueClub: Club (hosting venue, optional)
}
```

## Benefits

1. **Unified Management**: Single entity type for all organizations
2. **Flexible Tournament Creation**: Both clubs and venues can create tournaments
3. **Consistent Permissions**: Same role-based access control for all organization types
4. **Simplified Code**: No need for separate venue tournament logic
5. **Future Extensibility**: Easy to add new organization types (academies, leagues)

## Usage Examples

### Creating a Club Tournament
```java
Club club = new Club("5am Club", "https://5amclub.com", ClubType.CLUB);
Tournament tournament = new RoundRobinTournament(
    "Club Championship", 
    "Annual club tournament", 
    startDate, 
    endDate, 
    32, 
    club, 
    "admin-firebase-uid", 
    4
);
```

### Creating a Venue Tournament
```java
Club venue = new Club("Wattshot Padel", "https://wattshot.com", ClubType.VENUE, address);
Tournament tournament = new RoundRobinTournament(
    "Venue Open", 
    "Monthly venue tournament", 
    startDate, 
    endDate, 
    16, 
    venue, 
    "venue-manager-firebase-uid", 
    2
);
```

### Tournament with Different Owner and Host
```java
Club club = new Club("5am Club", "https://5amclub.com", ClubType.CLUB);
Club venue = new Club("Wattshot Padel", "https://wattshot.com", ClubType.VENUE, address);

Tournament tournament = new RoundRobinTournament(
    "Club vs Venue Championship", 
    "Tournament organized by club but hosted at venue", 
    startDate, 
    endDate, 
    24, 
    club,      // Owner/creator
    "admin-firebase-uid", 
    3
);
tournament.setVenueClub(venue); // Hosting venue
```

## Migration Notes

1. **Backward Compatibility**: The migration preserves existing data and provides helper methods for backward compatibility
2. **Gradual Transition**: Old venue tables are kept initially for safety
3. **Data Integrity**: All foreign key relationships are properly maintained
4. **Performance**: New indexes are created for optimal query performance

## Next Steps

1. Run the migration script: `06-merge-club-venue.sql`
2. Update any remaining code that references the old Venue entity
3. Test tournament creation with both clubs and venues
4. After verification, consider dropping the old venue tables in a future migration
