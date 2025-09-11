#!/bin/bash

# Test script for Run Booking API endpoints
# Make sure the backend is running on localhost:8080

BASE_URL="http://localhost:8080/api/run-bookings"
USER_ID="test-user-123"
USER_NAME="Test User"

echo "🧪 Testing Run Booking API Endpoints"
echo "===================================="

# Test 1: Health check
echo "1. Testing health check..."
curl -s -X GET "$BASE_URL/health" | jq '.' || echo "❌ Health check failed"

echo ""

# Test 2: Get bookings for current month
echo "2. Testing get bookings for current month..."
CURRENT_YEAR=$(date +%Y)
CURRENT_MONTH=$(date +%m)
curl -s -X GET "$BASE_URL/month/$CURRENT_YEAR/$CURRENT_MONTH?userId=$USER_ID" | jq '.' || echo "❌ Get bookings failed"

echo ""

# Test 3: Create a booking
echo "3. Testing create booking..."
BOOKING_DATE=$(date -d "+1 day" +%Y-%m-%d 2>/dev/null || date -v+1d +%Y-%m-%d)
BOOKING_PAYLOAD="{
  \"user_id\": \"$USER_ID\",
  \"user_name\": \"$USER_NAME\",
  \"booking_date\": \"$BOOKING_DATE\",
  \"booking_time\": \"05:00\"
}"

echo "Creating booking for date: $BOOKING_DATE"
CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d "$BOOKING_PAYLOAD")

echo "$CREATE_RESPONSE" | jq '.' || echo "❌ Create booking failed"

# Extract booking ID from response
BOOKING_ID=$(echo "$CREATE_RESPONSE" | jq -r '.booking.booking_id // empty')

echo ""

# Test 4: Get bookings again to see the new booking
echo "4. Testing get bookings after creation..."
curl -s -X GET "$BASE_URL/month/$CURRENT_YEAR/$CURRENT_MONTH?userId=$USER_ID" | jq '.' || echo "❌ Get bookings after creation failed"

echo ""

# Test 5: Cancel the booking (if we got a booking ID)
if [ ! -z "$BOOKING_ID" ] && [ "$BOOKING_ID" != "null" ]; then
    echo "5. Testing cancel booking..."
    curl -s -X DELETE "$BASE_URL/$BOOKING_ID?userId=$USER_ID" | jq '.' || echo "❌ Cancel booking failed"
    
    echo ""
    
    # Test 6: Get bookings after cancellation
    echo "6. Testing get bookings after cancellation..."
    curl -s -X GET "$BASE_URL/month/$CURRENT_YEAR/$CURRENT_MONTH?userId=$USER_ID" | jq '.' || echo "❌ Get bookings after cancellation failed"
else
    echo "5. Skipping cancel test - no booking ID received"
fi

echo ""
echo "✅ API testing complete!"
