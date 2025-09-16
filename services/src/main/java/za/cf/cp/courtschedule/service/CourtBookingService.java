package za.cf.cp.courtschedule.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import za.cf.cp.courtschedule.CourtBooking;
import za.cf.cp.courtschedule.dto.CourtBookingRequest;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class CourtBookingService {

    @Transactional
    public CourtBooking createBooking(CourtBookingRequest request) {
        System.out.println("Creating booking for user: " + request.userId + " on " + request.bookingDate);
        
        // Check if the court already has 4 players booked for this time slot
        var existingBookings = CourtBooking.<CourtBooking>list(
            "venueId = ?1 AND bookingDate = ?2 AND timeSlot = ?3 AND courtNumber = ?4 AND status = 'confirmed'",
            request.venueId, request.bookingDate, request.timeSlot, request.courtNumber
        );
        
        if (existingBookings.size() >= 4) {
            System.out.println("Court " + request.courtNumber + " already has 4 players booked for " + request.bookingDate + " at " + request.timeSlot);
            throw new RuntimeException("Court " + request.courtNumber + " is full (4 players). Please select another court.");
        }
        
        // Check if the user is already booked for this court and time slot
        var userExistingBooking = CourtBooking.<CourtBooking>find(
            "venueId = ?1 AND bookingDate = ?2 AND timeSlot = ?3 AND courtNumber = ?4 AND firebaseUid = ?5 AND status = 'confirmed'",
            request.venueId, request.bookingDate, request.timeSlot, request.courtNumber, request.userId
        ).firstResult();
        
        if (userExistingBooking != null) {
            System.out.println("User " + request.userId + " is already booked for court " + request.courtNumber + " on " + request.bookingDate + " at " + request.timeSlot);
            throw new RuntimeException("You are already playing on this court.");
        }
        
        // Auto-assign team if not specified
        if (request.teamNumber == null) {
            request.teamNumber = assignTeam(existingBookings);
            System.out.println("Auto-assigned user " + request.userId + " to Team " + request.teamNumber);
        } else {
            // Check if the specified team is full (2 players)
            var teamBookings = CourtBooking.<CourtBooking>list(
                "venueId = ?1 AND bookingDate = ?2 AND timeSlot = ?3 AND courtNumber = ?4 AND teamNumber = ?5 AND status = 'confirmed'",
                request.venueId, request.bookingDate, request.timeSlot, request.courtNumber, request.teamNumber
            );
            
            if (teamBookings.size() >= 2) {
                System.out.println("Team " + request.teamNumber + " is already full for court " + request.courtNumber);
                throw new RuntimeException("This team is already full. Please choose another team.");
            }
        }
        
        // Create new booking
        CourtBooking booking = new CourtBooking();
        booking.scheduleId = UUID.fromString(request.scheduleId);
        booking.firebaseUid = request.userId;
        booking.venueId = request.venueId;
        booking.bookingDate = request.bookingDate;
        booking.timeSlot = request.timeSlot;
        booking.gameDuration = request.gameDuration;
        booking.courtNumber = request.courtNumber;
        booking.teamNumber = request.teamNumber;
        // teamPosition field removed - no longer needed
        booking.status = request.status;
        
        // Persist the booking
        booking.persist();
        
        System.out.println("Successfully created booking: " + booking.bookingId);
        return booking;
    }

    public List<CourtBooking> getUserBookings(String userId, String startDate, String endDate) {
        System.out.println("Getting bookings for user: " + userId + " from " + startDate + " to " + endDate);
        
        try {
            var start = LocalDate.parse(startDate);
            var end = LocalDate.parse(endDate);
            
            var bookings = CourtBooking.<CourtBooking>list(
                "firebaseUid = ?1 AND bookingDate >= ?2 AND bookingDate <= ?3",
                userId, start, end
            );
            
            System.out.println("Found " + bookings.size() + " bookings for user: " + userId);
            return bookings;
        } catch (Exception e) {
            System.err.println("Error fetching user bookings: " + e.getMessage());
            e.printStackTrace();
            return List.of();
        }
    }

    @Transactional
    public boolean cancelBooking(UUID bookingId, String userId) {
        System.out.println("Cancelling booking: " + bookingId + " for user: " + userId);
        
        try {
            var booking = CourtBooking.<CourtBooking>findByIdOptional(bookingId);
            
            if (booking.isEmpty()) {
                System.out.println("Booking not found: " + bookingId);
                return false;
            }
            
            CourtBooking courtBooking = booking.get();
            
            // Check if user owns this booking
            if (!courtBooking.firebaseUid.equals(userId)) {
                System.out.println("User " + userId + " not authorized to cancel booking: " + bookingId);
                return false;
            }
            
            // Update status to cancelled
            courtBooking.status = "cancelled";
            courtBooking.persist();
            
            System.out.println("Successfully cancelled booking: " + bookingId);
            return true;
        } catch (Exception e) {
            System.err.println("Error cancelling booking: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
    
    /**
     * Auto-assigns team for a new player based on existing bookings
     * @param existingBookings List of existing bookings for the court
     * @return Team number (1 or 2)
     */
    private Integer assignTeam(List<CourtBooking> existingBookings) {
        // Count players in each team
        int team1Count = 0;
        int team2Count = 0;
        
        for (CourtBooking booking : existingBookings) {
            if (booking.teamNumber != null) {
                if (booking.teamNumber == 1) {
                    team1Count++;
                } else if (booking.teamNumber == 2) {
                    team2Count++;
                }
            }
        }
        
        // Assign to the team with fewer players, or Team 1 if equal
        if (team1Count <= team2Count && team1Count < 2) {
            return 1;
        } else if (team2Count < 2) {
            return 2;
        } else {
            // This shouldn't happen as we check for 4 players max above
            return 1;
        }
    }
}
