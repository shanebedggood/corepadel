package za.cf.cp.tournament;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import za.cf.cp.tournament.dto.TournamentConfigDto;
import za.cf.cp.tournament.dto.RoundRobinConfigDto;
import za.cf.cp.tournament.service.TournamentConfigService;

/**
 * REST resource for tournament configuration endpoints.
 * Provides tournament configuration data in the format expected by the frontend.
 */
@Path("/api/tournament-config")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class TournamentConfigResource {
    
    @Inject
    TournamentConfigService tournamentConfigService;
    
    /**
     * Get complete tournament configuration.
     * Returns all configuration data in the format expected by the frontend.
     */
    @GET
    public Response getTournamentConfig() {
        try {
            TournamentConfigDto config = tournamentConfigService.getTournamentConfig();
            return Response.ok(config).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error retrieving tournament configuration: " + e.getMessage())
                    .build();
        }
    }
    
    /**
     * Get round-robin specific configuration.
     * Returns round-robin configuration data in the format expected by the frontend.
     */
    @GET
    @Path("/round-robin")
    public Response getRoundRobinConfig() {
        try {
            RoundRobinConfigDto config = tournamentConfigService.getRoundRobinConfig();
            return Response.ok(config).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error retrieving round-robin configuration: " + e.getMessage())
                    .build();
        }
    }
    
    /**
     * Health check endpoint for tournament configuration.
     */
    @GET
    @Path("/health")
    public Response health() {
        return Response.ok("Tournament configuration service is running").build();
    }
} 