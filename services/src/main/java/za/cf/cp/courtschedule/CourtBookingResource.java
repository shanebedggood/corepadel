package za.cf.cp.courtschedule;

import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.jboss.logging.Logger;
import za.cf.cp.courtschedule.service.CourtBookingService;
import za.cf.cp.courtschedule.dto.CourtBookingRequest;

import java.util.List;
import java.util.UUID;

@Path("/api/court-bookings")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class CourtBookingResource {

    private static final Logger LOG = Logger.getLogger(CourtBookingResource.class);

    @Inject
    CourtBookingService service;

    @GET
    @Path("/user/{userId}")
    public Response getUserBookings(
            @PathParam("userId") String userId,
            @QueryParam("startDate") String startDate,
            @QueryParam("endDate") String endDate) {
        try {
            LOG.info("Fetching bookings for user: " + userId + " from " + startDate + " to " + endDate);
            
            if (startDate == null || endDate == null) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(java.util.Map.of("success", false, "message", "startDate and endDate are required"))
                        .build();
            }
            
            var bookings = service.getUserBookings(userId, startDate, endDate);
            
            LOG.info("Successfully fetched " + bookings.size() + " bookings for user: " + userId);
            return Response.ok(bookings).build();
        } catch (Exception e) {
            LOG.error("Error fetching user bookings: " + e.getMessage(), e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(java.util.Map.of("success", false, "message", "Error fetching user bookings"))
                    .build();
        }
    }

    @POST
    @Transactional
    public Response createBooking(CourtBookingRequest request) {
        try {
            LOG.info("Creating court booking: " + request);
            
            if (request == null) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(java.util.Map.of("success", false, "message", "Request body is required"))
                        .build();
            }
            
            var booking = service.createBooking(request);
            LOG.info("Successfully created court booking: " + booking.bookingId);
            
            var response = new java.util.HashMap<String, Object>();
            response.put("success", true);
            response.put("message", "Court booking created successfully");
            response.put("booking", booking);
            
            return Response.status(Response.Status.CREATED).entity(response).build();
        } catch (Exception e) {
            LOG.error("Error creating court booking: " + e.getMessage(), e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(java.util.Map.of("success", false, "message", "Error creating court booking: " + e.getMessage()))
                    .build();
        }
    }

    @DELETE
    @Path("/{bookingId}")
    @Transactional
    public Response cancelBooking(
            @PathParam("bookingId") String bookingId,
            @QueryParam("userId") String userId) {
        try {
            LOG.info("Cancelling booking: " + bookingId + " for user: " + userId);
            
            if (userId == null) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(java.util.Map.of("success", false, "message", "userId is required"))
                        .build();
            }
            
            var success = service.cancelBooking(UUID.fromString(bookingId), userId);
            
            if (success) {
                LOG.info("Successfully cancelled booking: " + bookingId);
                return Response.ok(java.util.Map.of("success", true, "message", "Booking cancelled successfully")).build();
            } else {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity(java.util.Map.of("success", false, "message", "Booking not found or not authorized"))
                        .build();
            }
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(java.util.Map.of("success", false, "message", "Invalid booking ID format"))
                    .build();
        } catch (Exception e) {
            LOG.error("Error cancelling booking: " + e.getMessage(), e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(java.util.Map.of("success", false, "message", "Error cancelling booking"))
                    .build();
        }
    }
}
