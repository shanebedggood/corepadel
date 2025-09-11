# 5AM Run Booking Component

## Overview
A comprehensive booking system for 5AM weekday runs that allows players to:
- View a monthly calendar with available booking slots
- Book runs for weekdays at 5AM
- See who else is booked for each time slot
- Cancel their own bookings
- Navigate between months

## Features

### Calendar View
- **Monthly Grid**: Displays a full calendar month with weekdays highlighted
- **Visual Indicators**: 
  - Green checkmark for user's bookings
  - Blue badges showing number of other runners
  - Different styling for weekends (not bookable)
  - Today's date highlighted
- **Interactive**: Click on any weekday to view/book that slot

### Booking Modal
- **Date Information**: Shows selected date and time (5:00 AM - 6:00 AM)
- **Current Runners**: Lists all runners booked for that slot
- **Booking Form**: Simple name input for new bookings
- **Cancel Option**: Users can cancel their own bookings

### User Experience
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Loading States**: Shows spinners during API calls
- **Error Handling**: Displays user-friendly error messages
- **Success Feedback**: Confirms successful bookings/cancellations

## Technical Implementation

### Service Layer (`run-booking.service.ts`)
- **API Integration**: Handles all backend communication
- **Data Models**: TypeScript interfaces for bookings and slots
- **Utility Methods**: Date formatting, weekday checking, month generation
- **Error Handling**: Graceful fallbacks for failed requests

### Component (`run-booking.component.ts`)
- **State Management**: Manages calendar state, bookings, and user info
- **Reactive Programming**: Uses RxJS for async operations
- **Lifecycle Management**: Proper cleanup with OnDestroy
- **User Authentication**: Integrates with Firebase auth service

### Styling (`run-booking.component.scss`)
- **Grid Layout**: CSS Grid for calendar structure
- **Responsive Design**: Mobile-first approach with breakpoints
- **Visual Feedback**: Hover states, active states, and transitions
- **Accessibility**: High contrast and clear visual hierarchy

## API Endpoints Required

The component expects the following backend endpoints:

```
GET /api/run-bookings/month/{year}/{month}?userId={userId}
POST /api/run-bookings
DELETE /api/run-bookings/{bookingId}
GET /api/run-bookings/user/{userId}?startDate={start}&endDate={end}
```

## Usage

1. Navigate to `/player/run-booking` in the application
2. Use month navigation arrows to browse different months
3. Click on any weekday to view booking details
4. Enter your name and click "Book Run" to create a booking
5. Use the cancel button to remove your booking

## Security

- **Authentication Required**: Component is protected by AuthGuard and ProfileCompletionGuard
- **User Validation**: Only authenticated users can create/cancel bookings
- **Data Isolation**: Users can only cancel their own bookings

## Future Enhancements

- **Recurring Bookings**: Allow weekly/monthly recurring bookings
- **Waitlist**: Add waitlist functionality for full slots
- **Notifications**: Email/SMS reminders for booked runs
- **Statistics**: Show user's booking history and attendance
- **Admin Features**: Allow admins to manage all bookings
