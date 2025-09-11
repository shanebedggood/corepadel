# Run Booking API Documentation

## Overview
The Run Booking API provides endpoints for managing 5AM weekday run bookings. Users can create, view, and cancel their run bookings through a RESTful interface.

## Base URL
```
http://localhost:8080/api/run-bookings
```

## Authentication
All endpoints require user authentication. The `userId` parameter should contain the user's Firebase UID.

## Endpoints

### 1. Health Check
**GET** `/health`

Check if the Run Booking service is running.

**Response:**
```json
{
  "status": "UP",
  "service": "RunBooking",
  "timestamp": 1703123456789
}
```

### 2. Get Bookings for Month
**GET** `/month/{year}/{month}?userId={userId}`

Retrieve all run bookings for a specific month, including user's booking status.

**Parameters:**
- `year` (path): Year (e.g., 2024)
- `month` (path): Month (1-12)
- `userId` (query): User's Firebase UID

**Response:**
```json
[
  {
    "date": "2024-01-15",
    "time": "05:00",
    "bookings": [
      {
        "booking_id": "123e4567-e89b-12d3-a456-426614174000",
        "user_id": "firebase-uid-123",
        "user_name": "John Doe",
        "booking_date": "2024-01-15",
        "booking_time": "05:00",
        "created_at": "2024-01-10T10:30:00",
        "updated_at": "2024-01-10T10:30:00"
      }
    ],
    "is_booked_by_user": true,
    "user_booking_id": "123e4567-e89b-12d3-a456-426614174000"
  }
]
```

### 3. Create Booking
**POST** `/`

Create a new run booking for a specific date.

**Request Body:**
```json
{
  "user_id": "firebase-uid-123",
  "user_name": "John Doe",
  "booking_date": "2024-01-15",
  "booking_time": "05:00"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Booking created successfully",
  "booking": {
    "booking_id": "123e4567-e89b-12d3-a456-426614174000",
    "firebase_uid": "firebase-uid-123",
    "user_name": "John Doe",
    "booking_date": "2024-01-15",
    "booking_time": "05:00",
    "created_at": "2024-01-10T10:30:00",
    "updated_at": "2024-01-10T10:30:00"
  }
}
```

### 4. Cancel Booking
**DELETE** `/{bookingId}?userId={userId}`

Cancel an existing run booking.

**Parameters:**
- `bookingId` (path): Booking UUID
- `userId` (query): User's Firebase UID (for security validation)

**Response:**
```json
{
  "success": true,
  "message": "Booking cancelled successfully"
}
```

### 5. Get User Bookings
**GET** `/user/{userId}?startDate={start}&endDate={end}`

Retrieve a user's bookings within a date range.

**Parameters:**
- `userId` (path): User's Firebase UID
- `startDate` (query): Start date (YYYY-MM-DD)
- `endDate` (query): End date (YYYY-MM-DD)

**Response:**
```json
[
  {
    "booking_id": "123e4567-e89b-12d3-a456-426614174000",
    "user_id": "firebase-uid-123",
    "user_name": "John Doe",
    "booking_date": "2024-01-15",
    "booking_time": "05:00",
    "created_at": "2024-01-10T10:30:00",
    "updated_at": "2024-01-10T10:30:00"
  }
]
```

## Error Responses

All endpoints return standardized error responses:

```json
{
  "success": false,
  "message": "Error description",
  "timestamp": 1703123456789
}
```

### Common Error Codes

- **400 Bad Request**: Invalid input parameters
- **404 Not Found**: Booking not found
- **500 Internal Server Error**: Server error

### Validation Rules

1. **Booking Date**: Must be a valid date in YYYY-MM-DD format
2. **Weekdays Only**: Bookings are only allowed on weekdays (Monday-Friday)
3. **One Booking Per User Per Date**: Users can only have one booking per date
4. **User Ownership**: Users can only cancel their own bookings
5. **Time**: Always 05:00 (5:00 AM)

## Database Schema

### run_booking Table

```sql
CREATE TABLE core.run_booking (
    booking_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firebase_uid VARCHAR(255) NOT NULL REFERENCES core.user(firebase_uid) ON DELETE CASCADE,
    user_name VARCHAR(255) NOT NULL,
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL DEFAULT '05:00:00',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(firebase_uid, booking_date)
);
```

### Indexes

- `idx_run_booking_date`: On booking_date
- `idx_run_booking_user`: On firebase_uid
- `idx_run_booking_created`: On created_at
- `idx_run_booking_date_user`: Composite index on (booking_date, firebase_uid)

## Testing

Use the provided test script to verify API functionality:

```bash
./test-run-booking-api.sh
```

## Security Considerations

1. **User Validation**: All operations validate user ownership
2. **Input Sanitization**: All inputs are validated and sanitized
3. **SQL Injection Prevention**: Using parameterized queries
4. **CORS**: Configured for frontend access
5. **Authentication**: Integrates with Firebase authentication

## Performance Considerations

1. **Database Indexes**: Optimized for common query patterns
2. **Pagination**: Consider implementing for large datasets
3. **Caching**: Consider Redis for frequently accessed data
4. **Connection Pooling**: Configured in Quarkus

## Future Enhancements

1. **Recurring Bookings**: Weekly/monthly recurring bookings
2. **Waitlist**: Queue system for full slots
3. **Notifications**: Email/SMS reminders
4. **Analytics**: Booking statistics and trends
5. **Admin Features**: Manage all bookings
6. **Capacity Limits**: Maximum runners per slot
