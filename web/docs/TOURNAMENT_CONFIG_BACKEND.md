# Tournament Config Backend Implementation

## Overview

This document describes the backend implementation for the tournament configuration service in Java/Quarkus. The implementation provides REST endpoints that return tournament configuration data in the same format as the Firebase implementation for seamless migration.

## Architecture

### Entity Layer
- **Entities**: JPA entities mapping to PostgreSQL tables
- **Converters**: Custom converters for JSONB and array handling
- **Relationships**: Proper foreign key relationships between entities

### Service Layer
- **TournamentConfigService**: Main service for configuration operations
- **Data Conversion**: Converts entities to DTOs matching Firebase format
- **Transaction Management**: Proper transaction handling for data operations

### REST Layer
- **TournamentConfigResource**: REST endpoints for configuration data
- **Error Handling**: Proper error responses and status codes
- **Content Types**: JSON responses with proper content type headers

## Components

### Entities

#### Core Entities
- `Category` - Tournament categories (Men's, Women's, Mixed, Open)
- `Format` - Tournament formats with JSONB rules
- `ProgressionType` - Round-robin progression types
- `RegistrationType` - Registration methods
- `TournamentStatus` - Tournament statuses with colors
- `VenueType` - Venue configurations

#### Round-Robin Entities
- `AdvancementModel` - Round-robin advancement models
- `EliminationBracketSize` - Bracket size configurations
- `TeamsToAdvance` - Teams to advance settings

### DTOs (Data Transfer Objects)

#### Main DTOs
- `TournamentConfigDto` - Complete configuration response
- `RoundRobinConfigDto` - Round-robin specific configuration

#### Individual DTOs
- `TournamentFormatDto` - Format data with Firebase structure
- `TournamentStatusDto` - Status data with colors
- `TournamentCategoryDto` - Category data
- `TournamentRegistrationTypeDto` - Registration type data
- `TournamentVenueTypeDto` - Venue type data
- `TournamentProgressionOptionDto` - Progression option data
- `AdvancementModelDto` - Advancement model data
- `EliminationBracketSizeDto` - Bracket size data
- `TeamsToAdvanceDto` - Teams to advance data

### Services

#### TournamentConfigService
- `getTournamentConfig()` - Returns complete configuration
- `getRoundRobinConfig()` - Returns round-robin configuration
- Individual getter methods for each entity type
- Conversion methods from entities to DTOs

### REST Endpoints

#### Main Endpoints
- `GET /api/tournament-config` - Get complete configuration
- `GET /api/tournament-config/round-robin` - Get round-robin configuration
- `GET /api/tournament-config/health` - Health check

## API Response Format

### Tournament Config Response
```json
{
  "formats": [
    {
      "id": "uuid",
      "name": "Single Elimination",
      "description": "Teams are eliminated after one loss",
      "isActive": true,
      "maxParticipants": 64,
      "minParticipants": 4,
      "rules": ["Rule 1", "Rule 2"],
      "category": "Elimination"
    }
  ],
  "statuses": [
    {
      "id": "uuid",
      "name": "Draft",
      "description": "Tournament is being planned",
      "color": "#6b7280",
      "textColor": "#ffffff",
      "isActive": true,
      "order": 1
    }
  ],
  "categories": [...],
  "registrationTypes": [...],
  "venueTypes": [...],
  "lastUpdated": "2024-01-01T12:00:00"
}
```

### Round Robin Config Response
```json
{
  "progressionTypes": [
    {
      "id": "uuid",
      "name": "Group based elimination",
      "description": "Elimination based on groups",
      "isActive": true
    }
  ],
  "groupAdvancementSettings": {
    "advancementModels": [
      {
        "id": "uuid",
        "name": "Trophy / Plate",
        "description": "Top team to trophy, bottom to plate",
        "isActive": true
      }
    ],
    "eliminationBracketSize": [
      {
        "id": "uuid",
        "name": "Final",
        "description": "2 teams advance to final",
        "teams": 2,
        "isActive": true
      }
    ]
  },
  "combinedAdvancementSettings": {
    "numOfTeamsToAdvanceOverall": [
      {
        "id": "uuid",
        "name": "8",
        "description": "8 teams per group",
        "isActive": true
      }
    ],
    "eliminationBracketSize": [...]
  },
  "lastUpdated": "2024-01-01T12:00:00"
}
```

## Database Integration

### Entity Mapping
- All entities extend `PanacheEntityBase` for simplified database operations
- UUID primary keys for consistency
- Proper column mappings with `@Column` annotations
- JSONB support for format rules

### Data Conversion
- `JsonArrayConverter` for JSONB array handling
- Entity to DTO conversion in service layer
- Firebase-compatible response format

## Error Handling

### Service Layer
- Try-catch blocks for database operations
- Proper exception propagation
- Transaction rollback on errors

### REST Layer
- HTTP status codes for different error types
- Descriptive error messages
- JSON error responses

## Testing

### Test Coverage
- `TournamentConfigResourceTest` - REST endpoint testing
- Entity creation and retrieval testing
- DTO conversion testing
- Error scenario testing

### Test Endpoints
- Health check endpoint testing
- Configuration retrieval testing
- Round-robin configuration testing

## Performance Considerations

### Database Optimization
- Indexes on frequently queried columns
- Efficient entity queries using Panache
- Connection pooling configuration

### Caching Strategy
- Consider Redis caching for frequently accessed data
- Cache invalidation on configuration updates
- Memory-based caching for static data

## Security

### Access Control
- Consider authentication/authorization for admin endpoints
- Input validation for configuration updates
- SQL injection prevention through JPA

### Data Validation
- Entity validation using Bean Validation
- DTO validation for API requests
- Business rule validation in service layer

## Deployment

### Configuration
- Database connection configuration
- Logging configuration
- Environment-specific settings

### Monitoring
- Health check endpoints
- Metrics collection
- Log aggregation

## Migration Strategy

### Frontend Integration
- Same API response format as Firebase
- No changes required to frontend code
- Gradual migration support

### Data Consistency
- Ensure all Firebase data is migrated
- Validate data integrity
- Test all tournament workflows

## Next Steps

1. **Database Migration**: Run the migration scripts from Phase 1
2. **Service Testing**: Test all endpoints with real data
3. **Frontend Integration**: Update frontend service calls
4. **Performance Testing**: Load test the new endpoints
5. **Deployment**: Deploy to staging/production environments 