# Tournament Migration from Firestore to PostgreSQL

## Overview

This guide describes the complete migration of the tournament system from Firebase Firestore to PostgreSQL. The migration includes all tournament-related data: tournaments, participants, groups, teams, and matches.

## Migration Status

### ✅ **Phase 1: Database Schema** - COMPLETE
- [x] Tournament tables created (`tournament`, `tournament_participant`, `tournament_group`, `tournament_team`, `tournament_match`)
- [x] Foreign key relationships established
- [x] Indexes for performance optimization
- [x] Triggers for automatic timestamp updates

### ✅ **Phase 2: Backend Implementation** - COMPLETE
- [x] Java entities created for all tournament tables
- [x] DTOs matching Firebase structure for backward compatibility
- [x] TournamentService with CRUD operations
- [x] TournamentResource REST endpoints
- [x] Integration with existing TournamentConfigService

### ✅ **Phase 3: Frontend Integration** - COMPLETE
- [x] QuarkusTournamentService created for PostgreSQL operations
- [x] Updated TournamentService with fallback to Firestore
- [x] Maintained backward compatibility during transition

### 🔄 **Phase 4: Data Migration** - PENDING
- [ ] Export tournament data from Firestore
- [ ] Transform data to PostgreSQL format
- [ ] Import data into PostgreSQL tables
- [ ] Verify data integrity

### 🔄 **Phase 5: Testing & Validation** - PENDING
- [ ] End-to-end testing of all tournament workflows
- [ ] Performance testing of PostgreSQL endpoints
- [ ] Data validation and integrity checks
- [ ] User acceptance testing

## Database Schema

### Tables Created

1. **tournament** - Main tournament information
2. **tournament_participant** - Tournament participants
3. **tournament_group** - Tournament groups
4. **tournament_team** - Tournament teams
5. **tournament_match** - Tournament matches

### Key Features

- **UUID Primary Keys**: All tables use UUID primary keys for consistency
- **Foreign Key Relationships**: Proper relationships between all entities
- **Automatic Timestamps**: Triggers update `updated_at` automatically
- **Performance Indexes**: Indexes on frequently queried columns
- **Cascade Deletes**: Proper cleanup when tournaments are deleted

## API Endpoints

### Tournament Endpoints

- `GET /api/tournaments` - Get all tournaments
- `GET /api/tournaments/{id}` - Get tournament by ID
- `POST /api/tournaments` - Create new tournament
- `PUT /api/tournaments/{id}` - Update tournament
- `DELETE /api/tournaments/{id}` - Delete tournament
- `GET /api/tournaments/club/{clubId}` - Get tournaments by club
- `GET /api/tournaments/user/{userId}` - Get tournaments by user
- `GET /api/tournaments/health` - Health check

### Configuration Endpoints (Already Migrated)

- `GET /api/tournament-config` - Get tournament configuration
- `GET /api/tournament-config/round-robin` - Get round-robin configuration

## Migration Steps

### 1. Database Setup

```bash
# Run the migration script
psql -h localhost -U keycloak -d corepadel -f database/migrate_tournament.sql
```

### 2. Backend Deployment

```bash
# Build and start the Quarkus service
cd services
./mvnw clean package
./mvnw quarkus:dev
```

### 3. Frontend Updates

The frontend has been updated to use the new PostgreSQL backend with Firestore fallback:

- `QuarkusTournamentService` - Primary PostgreSQL operations
- `TournamentService` - Updated with fallback to Firestore
- All existing components continue to work unchanged

### 4. Data Migration (Manual Process)

#### Export from Firestore
```javascript
// Export tournaments
const tournaments = await firebase.firestore().collection('tournaments').get();
const tournamentData = tournaments.docs.map(doc => ({ id: doc.id, ...doc.data() }));

// Export participants
const participants = await firebase.firestore().collectionGroup('participants').get();
const participantData = participants.docs.map(doc => ({ id: doc.id, ...doc.data() }));

// Export groups, teams, matches similarly
```

#### Transform and Import
```sql
-- Import tournaments
INSERT INTO tournament (tournament_id, name, description, start_date, end_date, ...)
VALUES (...);

-- Import participants
INSERT INTO tournament_participant (participant_id, tournament_id, uid, email, ...)
VALUES (...);

-- Import groups, teams, matches similarly
```

### 5. Verification

```bash
# Test API endpoints
curl http://localhost:8081/api/tournaments
curl http://localhost:8081/api/tournaments/health

# Verify data integrity
SELECT COUNT(*) FROM tournament;
SELECT COUNT(*) FROM tournament_participant;
SELECT COUNT(*) FROM tournament_group;
SELECT COUNT(*) FROM tournament_team;
SELECT COUNT(*) FROM tournament_match;
```

## Rollback Plan

If issues arise during migration:

1. **Frontend Rollback**: The existing Firestore code is preserved as fallback
2. **Database Rollback**: Drop tournament tables if needed
3. **Service Rollback**: Revert to previous Quarkus service version

## Performance Considerations

### Database Optimization
- Indexes on frequently queried columns (`club_id`, `user_id`, `status_id`)
- Composite indexes for complex queries
- Proper foreign key relationships for data integrity

### API Optimization
- Efficient entity queries using Panache
- Proper transaction management
- Error handling and logging

## Testing Strategy

### Unit Tests
- Entity creation and retrieval
- DTO conversion
- Service layer operations

### Integration Tests
- REST endpoint testing
- Database operations
- Error scenarios

### End-to-End Tests
- Complete tournament workflows
- Frontend-backend integration
- Performance under load

## Monitoring and Maintenance

### Health Checks
- Database connectivity
- Service availability
- Data integrity checks

### Performance Monitoring
- Query execution times
- API response times
- Database connection pool usage

### Error Handling
- Comprehensive error logging
- Graceful degradation
- Fallback mechanisms

## Next Steps

1. **Data Migration**: Export and import existing tournament data
2. **Testing**: Comprehensive testing of all functionality
3. **Performance Tuning**: Optimize queries and indexes as needed
4. **Documentation**: Update user documentation
5. **Training**: Train team on new system
6. **Go-Live**: Switch to PostgreSQL as primary data source
7. **Cleanup**: Remove Firestore fallback code after validation

## Support

For issues during migration:
1. Check the application logs
2. Verify database connectivity
3. Test individual API endpoints
4. Review error messages and stack traces
5. Consult the rollback plan if necessary 