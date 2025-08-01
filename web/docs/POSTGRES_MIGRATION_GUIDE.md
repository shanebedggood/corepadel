# PostgreSQL Migration Guide - Rules Feature

This guide documents the migration of the Rules feature from Firestore to PostgreSQL.

## Current Status

✅ **Completed:**
- Created PostgreSQL database schema (`database/ddl/rules.sql`)
- Created PostgreSQL data migration (`database/dml/rule.sql`)
- Created Quarkus Rule entity and REST resource
- Created Angular Quarkus service (`QuarkusRulesService`)
- Updated Angular component to use Quarkus service
- Updated environment configuration
- Configured CORS for Angular-Quarkus communication

## Migration Approach

### Quarkus Service Layer (Implemented)
- **Pros**: Enterprise-grade backend, proper separation of concerns, security, scalability
- **Cons**: Additional complexity, requires Java runtime
- **Status**: ✅ Implemented and ready for use

### Architecture
```
Angular Frontend → Quarkus REST API → PostgreSQL Database
```

### Why Quarkus?
- **Proper Architecture**: Clear separation between frontend, API, and database layers
- **Enterprise Features**: Built-in security, monitoring, and scalability
- **Type Safety**: Strong typing throughout the stack
- **Production Ready**: Battle-tested framework used by major enterprises

## Next Steps

### Immediate (Rules Feature)
1. **Start the Quarkus service**:
   ```bash
   cd services
   ./mvnw quarkus:dev
   ```
   The service will start on `http://localhost:8081`

2. **Apply database schema and data**:
   ```bash
   psql -h localhost -U keycloak -d corepadel -f database/ddl/rules.sql
   psql -h localhost -U keycloak -d corepadel -f database/dml/rule.sql
   ```

3. **Test the Angular application**:
   ```bash
   cd web/web-app
   npm start
   ```
   Navigate to `/rules` to see the migrated rules page

4. **Verify the integration**:
   - Check Quarkus logs for database queries
   - Test API endpoints: `http://localhost:8081/api/rules`
   - View Swagger documentation: `http://localhost:8081/swagger-ui`

### Future Features (Step-by-Step Migration)
Following the same pattern for other features:

1. **Venues** (next priority)
   - Schema: `database/ddl/venue.sql`
   - Data: `database/dml/venues.sql`
   - Service: `PostgresDirectVenuesService`

2. **Clubs**
   - Schema: `database/ddl/club.sql`
   - Data: `database/dml/club.sql`
   - Service: `PostgresDirectClubsService`

3. **Tournaments** (most complex)
   - Multiple tables and relationships
   - Complex business logic
   - Migrate last

## Database Schema

### Rules Table
```sql
CREATE TABLE rule (
    rule_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL UNIQUE,
    order_number SMALLINT,
    rule_description TEXT[]
);
```

### Data Structure
- **Firestore**: `description: string[]`
- **PostgreSQL**: `rule_description: TEXT[]`
- **Angular**: `rule_description: string[]`

## Service Interface

Both services implement the same interface:
```typescript
interface PadelRule {
    rule_id?: string;
    title: string;
    rule_description: string[];
    order_number?: number;
}
```

## Testing

1. **Unit Tests**: Test service methods
2. **Integration Tests**: Test database queries
3. **E2E Tests**: Test complete user flow

## Rollback Plan

If issues arise:
1. Keep both services available
2. Add feature flag to switch between Firestore and PostgreSQL
3. Gradually migrate users to PostgreSQL
4. Remove Firestore code once stable

## Security Considerations

### Quarkus Service Layer
- Database credentials secured in backend only
- Built-in security features (OIDC, JWT, etc.)
- API rate limiting and authentication
- Environment variables for secrets

## Performance Considerations

### Quarkus Service Layer
- Built-in connection pooling
- Query optimization with Hibernate
- Server-side caching capabilities
- Response compression
- Database connection management

## Monitoring

- Database query performance
- API response times
- Error rates
- User experience metrics 