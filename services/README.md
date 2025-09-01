# STRIDE & SERVE Quarkus Service

This is the backend service for the STRIDE & SERVE application, built with Quarkus and providing REST APIs for PostgreSQL data access.

## Features

- **Rules Management**: CRUD operations for padel rules
- **PostgreSQL Integration**: Direct connection to PostgreSQL database
- **REST APIs**: JSON-based REST endpoints
- **CORS Support**: Configured for Angular development
- **OpenAPI/Swagger**: API documentation at `/swagger-ui`

## Prerequisites

- Java 21+
- Maven 3.8+
- PostgreSQL database running
- STRIDE & SERVE database schema applied

## Setup

1. **Database Setup**:
   ```bash
   # Apply the database schema
   psql -h localhost -U keycloak -d corepadel -f ../database/ddl/rules.sql
   psql -h localhost -U keycloak -d corepadel -f ../database/dml/rule.sql
   ```

2. **Configuration**:
   The application is configured via `src/main/resources/application.properties`:
   - Database connection: PostgreSQL on localhost:5432
   - REST API: Port 8081
   - CORS: Enabled for Angular development

3. **Running the Service**:
   ```bash
   # Development mode
   ./mvnw quarkus:dev
   
   # Production build
   ./mvnw clean package
   java -jar target/quarkus-app/quarkus-run.jar
   ```

## API Endpoints

### Rules API

- `GET /api/rules` - Get all rules (sorted by order_number)
- `GET /api/rules/{id}` - Get a specific rule by ID
- `POST /api/rules` - Create a new rule
- `PUT /api/rules/{id}` - Update an existing rule
- `DELETE /api/rules/{id}` - Delete a rule
- `GET /api/rules/search?title={title}` - Search rules by title

### Example Usage

```bash
# Get all rules
curl http://localhost:8081/api/rules

# Create a new rule
curl -X POST http://localhost:8081/api/rules \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Rule",
    "orderNumber": 3,
    "ruleDescription": ["Point 1", "Point 2"]
  }'

# Update a rule
curl -X PUT http://localhost:8081/api/rules/1 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Rule Title"
  }'
```

## Data Models

### Rule Entity
```java
@Entity
@Table(name = "rule")
public class Rule extends PanacheEntity {
    public String title;
    public Integer orderNumber;
    public List<String> ruleDescription;
}
```

### JSON Format
```json
{
  "id": 1,
  "title": "Rule Title",
  "orderNumber": 1,
  "ruleDescription": ["Description point 1", "Description point 2"]
}
```

## Database Schema

The service connects to the PostgreSQL database with the following table:

```sql
CREATE TABLE rule (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL UNIQUE,
    order_number INTEGER,
    rule_description TEXT[]
);
```

## Integration with Angular

The Angular application connects to this service via the `QuarkusRulesService`:

```typescript
@Injectable()
export class QuarkusRulesService {
  private readonly apiUrl = 'http://localhost:8081/api';
  
  getPadelRules(): Observable<PadelRule[]> {
    return this.http.get<PadelRule[]>(`${this.apiUrl}/rules`);
  }
}
```

## Development

### Adding New Endpoints

1. Create entity class in `src/main/java/za/cf/cp/`
2. Create resource class extending `PanacheEntityResource`
3. Add custom methods as needed
4. Update this README with endpoint documentation

### Database Changes

When modifying the database schema:

1. Update the DDL files in the `../database/` directory
2. Modify the entity classes to match the schema
3. Update the resource classes if needed
4. Test the integration thoroughly

## Testing

### Unit Tests
```bash
./mvnw test
```

### Integration Tests
```bash
./mvnw verify
```

### Manual Testing
1. Start the service: `./mvnw quarkus:dev`
2. Access Swagger UI: `http://localhost:8081/swagger-ui`
3. Test endpoints via the interactive documentation

## Deployment

### Local Development
```bash
./mvnw quarkus:dev
```

### Production
```bash
./mvnw clean package
java -jar target/quarkus-app/quarkus-run.jar
```

### Docker
```bash
./mvnw clean package -Dquarkus.package.type=native
docker build -f src/main/docker/Dockerfile.native -t corepadel-service .
```

## Monitoring

- Application logs: Check console output
- Database queries: Enabled via `quarkus.hibernate-orm.log.sql=true`
- Health checks: Available at `/health` (if health extension is added)
- Metrics: Available at `/metrics` (if metrics extension is added)

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check database credentials in `application.properties`
- Ensure the database and tables exist

### CORS Issues
- Verify the Angular app origin is in the CORS configuration
- Check that the service is running on the expected port

### Data Format Issues
- Check that the database schema matches the entity classes
- Verify the JSON serialization/deserialization
