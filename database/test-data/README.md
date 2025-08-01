# Tournament Test Data Scripts

This directory contains SQL scripts to add test data to your PostgreSQL database for testing tournament functionality.

## Quick Start

1. **First, run the helper queries** to find your tournament ID:
   ```sql
   -- Find your tournament ID
   SELECT tournament_id, name FROM core.tournament ORDER BY created_at DESC LIMIT 1;
   ```

2. **Add test players** (run once):
   ```bash
   psql -d your_database -f database/test-data/test-players.sql
   ```

3. **Add participants to a tournament** (replace `YOUR_TOURNAMENT_ID`):
   ```bash
   # Edit the file to replace YOUR_TOURNAMENT_ID with actual ID
   psql -d your_database -f database/test-data/test-tournament-participants.sql
   ```

4. **Add groups and teams** (replace IDs):
   ```bash
   # Edit the file to replace YOUR_TOURNAMENT_ID and group IDs
   psql -d your_database -f database/test-data/test-tournament-groups-teams.sql
   ```

5. **Add matches** (replace IDs):
   ```bash
   # Edit the file to replace all IDs with actual values
   psql -d your_database -f database/test-data/test-tournament-matches.sql
   ```

## Scripts Overview

### 1. `test-players.sql`
- Adds 16 test players with different ratings (62-88)
- Players have realistic names and contact information
- Use these players to test participant management

### 2. `test-tournament-participants.sql`
- Adds 8 test participants to a tournament
- Mix of high and medium-rated players
- Updates tournament participant count

### 3. `test-tournament-groups-teams.sql`
- Creates 4 groups (A, B, C, D) with 4 teams each
- Teams are created with 2 players each
- Balances player ratings across teams

### 4. `test-tournament-matches.sql`
- Creates group stage matches for all teams
- Mix of completed and scheduled matches
- Realistic scores and timing

### 5. `helper-queries.sql`
- Useful queries to find IDs and verify data
- Cleanup queries for removing test data
- Verification queries to check data integrity

## Finding Required IDs

Before running the scripts, you need to find these IDs:

### Tournament ID
```sql
SELECT tournament_id, name FROM core.tournament ORDER BY created_at DESC LIMIT 1;
```

### Group IDs (after creating groups)
```sql
SELECT group_id, name FROM core.tournament_group WHERE tournament_id = 'YOUR_TOURNAMENT_ID';
```

### Team IDs (after creating teams)
```sql
SELECT team_id, name, group_id FROM core.tournament_team WHERE tournament_id = 'YOUR_TOURNAMENT_ID';
```

## Test Data Structure

### Players (16 total)
- **High-rated**: 4 players (80-88 rating)
- **Medium-rated**: 4 players (72-78 rating)  
- **Lower-rated**: 4 players (62-70 rating)
- **Additional**: 4 players (71-77 rating)

### Tournament Structure
- **Groups**: 4 groups (A, B, C, D)
- **Teams per group**: 4 teams
- **Players per team**: 2 players
- **Matches**: 6 matches per group (round-robin)

### Match Status
- **Completed**: 6 matches with scores
- **Scheduled**: 6 matches without scores
- **Realistic timing**: Past and future timestamps

## Testing Scenarios

### 1. Participant Management
- Add/remove participants
- View participant list
- Check participant count limits

### 2. Group Management
- View groups and teams
- Check team assignments
- Verify player distribution

### 3. Match Management
- View match schedule
- Enter scores for completed matches
- Update match status

### 4. Tournament Flow
- Test complete tournament lifecycle
- Verify data consistency
- Check UI updates

## Cleanup

To remove test data:

```sql
-- Remove test participants
DELETE FROM core.tournament_participant WHERE tournament_id = 'YOUR_TOURNAMENT_ID' AND uid LIKE 'test_player_%';

-- Remove test matches
DELETE FROM core.tournament_match WHERE tournament_id = 'YOUR_TOURNAMENT_ID';

-- Remove test teams
DELETE FROM core.tournament_team WHERE tournament_id = 'YOUR_TOURNAMENT_ID';

-- Remove test groups
DELETE FROM core.tournament_group WHERE tournament_id = 'YOUR_TOURNAMENT_ID';

-- Remove test players (all test data)
DELETE FROM core.user WHERE firebase_uid LIKE 'test_player_%';
```

## Notes

- **Reliable**: Direct PostgreSQL insertion is very reliable for testing
- **Consistent**: Data follows the same structure as your application
- **Realistic**: Test data mimics real tournament scenarios
- **Safe**: All test data is clearly marked and easy to remove
- **Comprehensive**: Covers all major tournament features

## Troubleshooting

### Common Issues

1. **Foreign key errors**: Make sure all referenced IDs exist
2. **Duplicate key errors**: Test data may already exist
3. **Permission errors**: Ensure database user has INSERT permissions

### Verification

After running scripts, verify data with:
```sql
-- Check participant count
SELECT COUNT(*) FROM core.tournament_participant WHERE tournament_id = 'YOUR_TOURNAMENT_ID';

-- Check team count
SELECT COUNT(*) FROM core.tournament_team WHERE tournament_id = 'YOUR_TOURNAMENT_ID';

-- Check match count
SELECT COUNT(*) FROM core.tournament_match WHERE tournament_id = 'YOUR_TOURNAMENT_ID';
``` 