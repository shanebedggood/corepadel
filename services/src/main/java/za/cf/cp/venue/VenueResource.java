package za.cf.cp.venue;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import za.cf.cp.venue.service.VenueService;
import za.cf.cp.venue.dto.VenueDto;

import java.util.List;

/**
 * REST resource for venue operations.
 */
@Path("/api/venues")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class VenueResource {

    @Inject
    VenueService venueService;

    /**
     * Get all venues.
     */
    @GET
    public Response getAllVenues() {
        try {
            List<VenueDto> venues = venueService.getAllVenues();
            return Response.ok(venues).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error retrieving venues: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Get venue by ID.
     */
    @GET
    @Path("/{id}")
    public Response getVenueById(@PathParam("id") String id) {
        try {
            VenueDto venue = venueService.getVenueById(id);
            if (venue == null) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity("Venue not found")
                        .build();
            }
            return Response.ok(venue).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error retrieving venue: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Create a new venue.
     */
    @POST
    public Response createVenue(VenueDto venueDto) {
        try {
            VenueDto createdVenue = venueService.createVenue(venueDto);
            return Response.status(Response.Status.CREATED)
                    .entity(createdVenue)
                    .build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error creating venue: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Update an existing venue.
     */
    @PUT
    @Path("/{id}")
    public Response updateVenue(@PathParam("id") String id, VenueDto venueDto) {
        try {
            VenueDto updatedVenue = venueService.updateVenue(id, venueDto);
            if (updatedVenue == null) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity("Venue not found")
                        .build();
            }
            return Response.ok(updatedVenue).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error updating venue: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Delete a venue.
     */
    @DELETE
    @Path("/{id}")
    public Response deleteVenue(@PathParam("id") String id) {
        try {
            boolean deleted = venueService.deleteVenue(id);
            if (!deleted) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity("Venue not found")
                        .build();
            }
            return Response.ok().build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error deleting venue: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Health check endpoint.
     */
    @GET
    @Path("/health")
    public Response healthCheck() {
        return Response.ok("Venue service is running").build();
    }
} 