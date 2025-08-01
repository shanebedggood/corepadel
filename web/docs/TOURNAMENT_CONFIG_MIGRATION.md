# Tournament Config Migration to PostgreSQL

## Overview

This document describes the migration of tournament configuration data from Firebase to PostgreSQL. The migration includes all tournament configuration entities and their relationships.

## Database Schema

### Tables Created

1. **category** - Tournament categories (Men's, Women's, Mixed, Open)
2. **format** - Tournament formats (Single Elimination, Double Elimination, Round Robin, Swiss System)
3. **progression_type** - Progression types for round-robin tournaments
4. **registration_type** - Registration types (Individual, Team, Individual or Team)
5. **tournament_status** - Tournament statuses (Draft, Registration Open, etc.)
6. **venue_type** - Venue types (Single Venue, Multiple Venues)
7. **advancement_model** - Advancement models for round-robin (Trophy/Plate, Elimination Only)
8. **elimination_bracket_size** - Bracket sizes (Final, Semi-finals, Quarter-finals)
9. **teams_to_advance** - Teams to advance settings (1, 2, 4, 8 teams per group)

### Key Features

- **UUID Primary Keys**: All tables use UUID primary keys for consistency
- **Active/Inactive Flags**: All tables include `is_active` boolean flags
- **Order Numbers**: All tables include `order_number` for consistent sorting
- **JSONB Rules**: Format rules are stored as JSONB for better querying
- **Performance Indexes**: Indexes on `is_active` columns for efficient filtering

## Migration Files

### 1. DDL (Data Definition Language)
- `database/ddl/tournament_config.sql` - Table definitions and indexes

### 2. DML (Data Manipulation Language)
- `database/dml/tournament_config.sql` - Seed data insertion

### 3. Complete Migration Script
- `database/migrate_tournament_config.sql` - Complete migration with verification

### 4. Verification Script
- `database/verify_tournament_config.sql` - Data verification and validation

## Data Migration

### Firebase to PostgreSQL Mapping

| Firebase Collection | PostgreSQL Table | Notes |
|-------------------|------------------|-------|
| tournament_config/main.formats | format | JSONB rules, active flags |
| tournament_config/main.statuses | tournament_status | Color/text_color preserved |
| tournament_config/main.categories | category | Active flags added |
| tournament_config/main.registrationTypes | registration_type | Active flags added |
| tournament_config/main.venueTypes | venue_type | Active flags added |
| tournament_config/round_robin.progressionTypes | progression_type | Active flags added |
| tournament_config/round_robin.groupAdvancementSettings.advancementModels | advancement_model | New table |
| tournament_config/round_robin.groupAdvancementSettings.eliminationBracketSize | elimination_bracket_size | New table |
| tournament_config/round_robin.combinedAdvancementSettings.numOfTeamsToAdvanceOverall | teams_to_advance | New table |

### Seed Data Summary

- **4 Categories**: Men's, Women's, Mixed, Open
- **4 Formats**: Single Elimination, Double Elimination, Round Robin, Swiss System
- **2 Progression Types**: Group based elimination, Combined elimination
- **3 Registration Types**: Individual, Team, Individual or Team
- **6 Tournament Statuses**: Draft, Registration Open, Registration Closed, In Progress, Completed, Cancelled
- **2 Venue Types**: Single Venue, Multiple Venues
- **2 Advancement Models**: Trophy / Plate, Elimination only
- **3 Elimination Bracket Sizes**: Final (2 teams), Semi-finals (4 teams), Quarter-finals (8 teams)
- **4 Teams to Advance**: 1, 2, 4, 8 teams per group

## Running the Migration

### Prerequisites
- PostgreSQL database with UUID extension
- Appropriate database permissions

### Steps

1. **Run the migration script**:
   ```sql
   \i database/migrate_tournament_config.sql
   ```

2. **Verify the migration**:
   ```sql
   \i database/verify_tournament_config.sql
   ```

### Expected Results

After successful migration, you should see:
- 9 tables created with proper indexes
- All seed data inserted (4+4+2+3+6+2+2+3+4 = 30 total records)
- All records marked as active
- No duplicate names
- Proper JSONB rules in format table

## Data Structure Changes

### Format Rules
- **Before**: TEXT array in Firebase
- **After**: JSONB array in PostgreSQL for better querying and validation

### Active/Inactive Management
- **Before**: `isActive` boolean in Firebase objects
- **After**: `is_active` boolean column in PostgreSQL tables

### Ordering
- **Before**: Implicit ordering in Firebase arrays
- **After**: Explicit `order_number` column for consistent sorting

## Performance Considerations

### Indexes Created
- `idx_category_active` on category(is_active)
- `idx_format_active` on format(is_active)
- `idx_progression_type_active` on progression_type(is_active)
- `idx_registration_type_active` on registration_type(is_active)
- `idx_tournament_status_active` on tournament_status(is_active)
- `idx_venue_type_active` on venue_type(is_active)
- `idx_advancement_model_active` on advancement_model(is_active)
- `idx_elimination_bracket_size_active` on elimination_bracket_size(is_active)
- `idx_teams_to_advance_active` on teams_to_advance(is_active)

### Query Optimization
- All queries should filter by `is_active = true` for production data
- Use `order_number` for consistent sorting
- JSONB rules can be queried efficiently with PostgreSQL JSON operators

## Next Steps

After Phase 1 completion:

1. **Phase 2**: Implement backend service layer (Java/Quarkus)
2. **Phase 3**: Update frontend service calls
3. **Phase 4**: Test and validate all tournament workflows

## Rollback Plan

If migration issues occur:
1. Keep Firebase configuration as backup
2. Drop PostgreSQL tables if needed
3. Re-run migration script after fixing issues
4. Verify data integrity before proceeding to Phase 2 