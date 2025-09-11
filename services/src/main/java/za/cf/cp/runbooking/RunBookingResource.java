package za.cf.cp.runbooking;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.jboss.logging.Logger;
import za.cf.cp.runbooking.dto.RunBookingDto;
import za.cf.cp.runbooking.dto.RunSlotDto;
import za.cf.cp.runbooking.service.RunBookingService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * REST controller for RunBooking operations.
 * Provides API endpoints for 5AM run booking functionality.
 */
@Path("/api/run-bookings")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class RunBookingResource {
    
    private static final Logger LOG = Logger.getLogger(RunBookingResource.class);
    
    @Inject
    RunBookingService runBookingService;
    
    /**
     * Get all run bookings for a specific month
     * GET /api/run-bookings/month/{year}/{month}?userId={userId}
     */
    @GET
    @Path("/month/{year}/{month}")
    public Response getBookingsForMonth(
            @PathParam("year") int year,
            @PathParam("month") int month,
            @QueryParam("userId") String userId) {
        
        try {
            LOG.info("Getting bookings for month: " + year + "/" + month + " for user: " + userId);
            
            if (userId == null || userId.trim().isEmpty()) {
                return Response.status(Response.Status.BAD_REQUEST)
                    .entity(createErrorResponse("User ID is required"))
                    .build();
            }
            
            // Validate month range
            if (month < 1 || month > 12) {
                return Response.status(Response.Status.BAD_REQUEST)
                    .entity(createErrorResponse("Month must be between 1 and 12"))
                    .build();
            }
            
            // Validate year range
            if (year < 2020 || year > 2030) {
                return Response.status(Response.Status.BAD_REQUEST)
                    .entity(createErrorResponse("Year must be between 2020 and 2030"))
                    .build();
            }
            
            List<RunSlotDto> slots = runBookingService.getBookingsForMonth(year, month, userId);
            
            return Response.ok(slots).build();
            
        } catch (Exception e) {
            LOG.error("Error getting bookings for month: " + year + "/" + month, e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(createErrorResponse("Failed to retrieve bookings: " + e.getMessage()))
                .build();
        }
    }
    
    /**
     * Create a new run booking
     * POST /api/run-bookings
     */
    @POST
    public Response createBooking(RunBookingDto bookingDto) {
        try {
            LOG.info("Creating booking for user: " + bookingDto.getUserId() + " on date: " + bookingDto.getBookingDate());
            
            var booking = runBookingService.createBooking(bookingDto);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Booking created successfully");
            response.put("booking", booking);
            
            return Response.status(Response.Status.CREATED)
                .entity(response)
                .build();
            
        } catch (IllegalArgumentException e) {
            LOG.warn("Invalid booking request: " + e.getMessage());
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(createErrorResponse(e.getMessage()))
                .build();
        } catch (Exception e) {
            LOG.error("Error creating booking", e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(createErrorResponse("Failed to create booking: " + e.getMessage()))
                .build();
        }
    }
    
    /**
     * Cancel a run booking
     * DELETE /api/run-bookings/{bookingId}
     */
    @DELETE
    @Path("/{bookingId}")
    public Response cancelBooking(
            @PathParam("bookingId") String bookingIdStr,
            @QueryParam("userId") String userId) {
        
        try {
            LOG.info("Cancelling booking: " + bookingIdStr + " for user: " + userId);
            
            if (userId == null || userId.trim().isEmpty()) {
                return Response.status(Response.Status.BAD_REQUEST)
                    .entity(createErrorResponse("User ID is required"))
                    .build();
            }
            
            UUID bookingId;
            try {
                bookingId = UUID.fromString(bookingIdStr);
            } catch (IllegalArgumentException e) {
                return Response.status(Response.Status.BAD_REQUEST)
                    .entity(createErrorResponse("Invalid booking ID format"))
                    .build();
            }
            
            boolean deleted = runBookingService.cancelBooking(bookingId, userId);
            
            if (deleted) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Booking cancelled successfully");
                
                return Response.ok(response).build();
            } else {
                return Response.status(Response.Status.NOT_FOUND)
                    .entity(createErrorResponse("Booking not found or could not be cancelled"))
                    .build();
            }
            
        } catch (IllegalArgumentException e) {
            LOG.warn("Invalid cancel request: " + e.getMessage());
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(createErrorResponse(e.getMessage()))
                .build();
        } catch (Exception e) {
            LOG.error("Error cancelling booking: " + bookingIdStr, e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(createErrorResponse("Failed to cancel booking: " + e.getMessage()))
                .build();
        }
    }
    
    /**
     * Get user's bookings within a date range
     * GET /api/run-bookings/user/{userId}?startDate={start}&endDate={end}
     */
    @GET
    @Path("/user/{userId}")
    public Response getUserBookings(
            @PathParam("userId") String userId,
            @QueryParam("startDate") String startDate,
            @QueryParam("endDate") String endDate) {
        
        try {
            LOG.info("Getting bookings for user: " + userId + " from " + startDate + " to " + endDate);
            
            if (startDate == null || startDate.trim().isEmpty()) {
                return Response.status(Response.Status.BAD_REQUEST)
                    .entity(createErrorResponse("Start date is required"))
                    .build();
            }
            
            if (endDate == null || endDate.trim().isEmpty()) {
                return Response.status(Response.Status.BAD_REQUEST)
                    .entity(createErrorResponse("End date is required"))
                    .build();
            }
            
            List<RunBookingDto> bookings = runBookingService.getUserBookings(userId, startDate, endDate);
            
            return Response.ok(bookings).build();
            
        } catch (Exception e) {
            LOG.error("Error getting user bookings for: " + userId, e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(createErrorResponse("Failed to retrieve user bookings: " + e.getMessage()))
                .build();
        }
    }
    
    /**
     * Health check endpoint
     * GET /api/run-bookings/health
     */
    @GET
    @Path("/health")
    public Response healthCheck() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "RunBooking");
        response.put("timestamp", System.currentTimeMillis());
        
        return Response.ok(response).build();
    }
    
    /**
     * Create a standardized error response
     */
    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", message);
        response.put("timestamp", System.currentTimeMillis());
        return response;
    }
}
