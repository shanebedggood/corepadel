package za.cf.cp.club;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import za.cf.cp.club.service.ClubService;

import java.util.List;
import java.util.Optional;

/**
 * REST resource for managing clubs.
 */
@Path("/api/clubs")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ClubResource {
    
    @Inject
    ClubService clubService;
    
    /**
     * Get all clubs
     */
    @GET
    public Response getAllClubs() {
        try {
            List<Club> clubs = clubService.getAllClubs();
            return Response.ok(clubs).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error retrieving clubs: " + e.getMessage())
                    .build();
        }
    }
    
    /**
     * Get a club by ID
     */
    @GET
    @Path("/{clubId}")
    public Response getClubById(@PathParam("clubId") String clubId) {
        try {
            Optional<Club> club = clubService.getClubById(clubId);
            if (club.isPresent()) {
                return Response.ok(club.get()).build();
            } else {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity("Club not found with ID: " + clubId)
                        .build();
            }
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error retrieving club: " + e.getMessage())
                    .build();
        }
    }
    
    /**
     * Create a new club
     */
    @POST
    public Response createClub(Club club) {
        try {
            Club createdClub = clubService.createClub(club);
            return Response.status(Response.Status.CREATED).entity(createdClub).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error creating club: " + e.getMessage())
                    .build();
        }
    }
    
    /**
     * Update an existing club
     */
    @PUT
    @Path("/{clubId}")
    public Response updateClub(@PathParam("clubId") String clubId, Club club) {
        try {
            Optional<Club> updatedClub = clubService.updateClub(clubId, club);
            if (updatedClub.isPresent()) {
                return Response.ok(updatedClub.get()).build();
            } else {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity("Club not found with ID: " + clubId)
                        .build();
            }
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error updating club: " + e.getMessage())
                    .build();
        }
    }
    
    /**
     * Delete a club
     */
    @DELETE
    @Path("/{clubId}")
    public Response deleteClub(@PathParam("clubId") String clubId) {
        try {
            boolean deleted = clubService.deleteClub(clubId);
            if (deleted) {
                return Response.ok("Club deleted successfully").build();
            } else {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity("Club not found with ID: " + clubId)
                        .build();
            }
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error deleting club: " + e.getMessage())
                    .build();
        }
    }
    
    /**
     * Health check endpoint
     */
    @GET
    @Path("/health")
    public Response health() {
        return Response.ok("Club service is healthy").build();
    }
} 