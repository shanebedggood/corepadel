# API Endpoint Changes for Club/Venue Merge

## Overview

With the unified Club entity structure, the API endpoints have been updated to support both clubs and venues through a single endpoint structure.

## New Endpoints

### Club API (`/api/clubs`)

**Get All Clubs**
- `GET /api/clubs` - Returns all clubs and venues
- `GET /api/clubs?type=CLUB` - Returns only traditional clubs
- `GET /api/clubs?type=VENUE` - Returns only venues
- `GET /api/clubs?type=ACADEMY` - Returns only academies
- `GET /api/clubs?type=LEAGUE` - Returns only leagues

**Get All Venues (Convenience Endpoint)**
- `GET /api/clubs/venues` - Returns only venues (same as `?type=VENUE`)

**Other Club Endpoints**
- `GET /api/clubs/{id}` - Get club by ID
- `POST /api/clubs` - Create new club
- `PUT /api/clubs/{id}` - Update club
- `DELETE /api/clubs/{id}` - Delete club

## Migration from Venues to Clubs

### Important: Venues No Longer Exist

With the unified Club entity structure, **venues no longer exist as separate entities**. All venues are now clubs with `type = VENUE`.

**The `/api/venues` endpoint has been completely removed.**

## Frontend Changes Required

### Required: Update to New Endpoints
**You must update your frontend** to use the new Club API:

```javascript
// Old way (NO LONGER WORKS)
fetch('/api/venues')

// New way (REQUIRED)
fetch('/api/clubs?type=VENUE')
// or
fetch('/api/clubs/venues')
```

## Response Format

The response format remains the same, but now includes additional fields:

```json
{
  "club_id": "uuid",
  "name": "Club/Venue Name",
  "website": "https://example.com",
  "type": "CLUB|VENUE|ACADEMY|LEAGUE",
  "facilities": [...], // Only for venues
  "address": {...}     // Only for venues
}
```

## Migration Steps

1. **Run the database migration**: `06-merge-club-venue.sql`
2. **Update frontend code** to use new endpoints (optional - old endpoints still work)
3. **Test both club and venue functionality**
4. **Update any documentation** that references the old venue endpoints

## Benefits

1. **Unified API**: Single endpoint structure for all organization types
2. **Flexible Filtering**: Easy to filter by organization type
3. **Backward Compatibility**: Existing frontend code continues to work
4. **Future Extensibility**: Easy to add new organization types
5. **Consistent Data Model**: Same response format for all organization types

## Example Usage

### Get All Venues
```bash
curl -X GET "http://localhost:8080/api/clubs?type=VENUE"
```

### Get All Clubs
```bash
curl -X GET "http://localhost:8080/api/clubs?type=CLUB"
```

### Get All Organizations
```bash
curl -X GET "http://localhost:8080/api/clubs"
```

### Create a New Venue
```bash
curl -X POST "http://localhost:8080/api/clubs" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Padel Venue",
    "website": "https://newvenue.com",
    "type": "VENUE",
    "address": {...}
  }'
```
