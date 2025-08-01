package za.cf.cp.tournament;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import za.cf.cp.tournament.dto.TournamentDto;
import za.cf.cp.tournament.service.TournamentService;

import java.util.List;
import java.util.Optional;

/**
 * REST resource for tournament endpoints.
 * Provides tournament CRUD operations in the format expected by the frontend.
 */
@Path("/api/tournaments")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class TournamentResource {
    
    @Inject
    TournamentService tournamentService;
    
    /**
     * Get all tournaments.
     */
    @GET
    public Response getAllTournaments() {
        try {
            List<TournamentDto> tournaments = tournamentService.getAllTournaments();
            return Response.ok(tournaments).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error retrieving tournaments: " + e.getMessage())
                    .build();
        }
    }
    
    /**
     * Get tournament by ID.
     */
    @GET
    @Path("/{id}")
    public Response getTournamentById(@PathParam("id") String id) {
        try {
            Optional<TournamentDto> tournament = tournamentService.getTournamentById(id);
            if (tournament.isPresent()) {
                return Response.ok(tournament.get()).build();
            } else {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity("Tournament not found with ID: " + id)
                        .build();
            }
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error retrieving tournament: " + e.getMessage())
                    .build();
        }
    }
    
    /**
     * Create a new tournament.
     */
    @POST
    public Response createTournament(TournamentDto tournamentDto) {
        try {
            System.out.println("Received tournament data: " + tournamentDto);
            System.out.println("userId from DTO: " + (tournamentDto != null ? tournamentDto.getUserId() : "DTO is null"));
            System.out.println("userId field value: " + (tournamentDto != null ? tournamentDto.userId : "DTO is null"));
            String tournamentId = tournamentService.createTournament(tournamentDto);
            return Response.status(Response.Status.CREATED)
                    .entity("{\"id\": \"" + tournamentId + "\"}")
                    .build();
        } catch (Exception e) {
            System.err.println("Error creating tournament: " + e.getMessage());
            e.printStackTrace();
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error creating tournament: " + e.getMessage())
                    .build();
        }
    }
    
    /**
     * Update an existing tournament.
     */
    @PUT
    @Path("/{id}")
    public Response updateTournament(@PathParam("id") String id, TournamentDto tournamentDto) {
        try {
            boolean updated = tournamentService.updateTournament(id, tournamentDto);
            if (updated) {
                return Response.ok().build();
            } else {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity("Tournament not found with ID: " + id)
                        .build();
            }
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error updating tournament: " + e.getMessage())
                    .build();
        }
    }
    
    /**
     * Delete a tournament.
     */
    @DELETE
    @Path("/{id}")
    public Response deleteTournament(@PathParam("id") String id) {
        try {
            boolean deleted = tournamentService.deleteTournament(id);
            if (deleted) {
                return Response.ok().build();
            } else {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity("Tournament not found with ID: " + id)
                        .build();
            }
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error deleting tournament: " + e.getMessage())
                    .build();
        }
    }
    
    /**
     * Get tournaments by club ID.
     */
    @GET
    @Path("/club/{clubId}")
    public Response getTournamentsByClubId(@PathParam("clubId") String clubId) {
        try {
            List<TournamentDto> tournaments = tournamentService.getTournamentsByClubId(clubId);
            return Response.ok(tournaments).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error retrieving tournaments for club: " + e.getMessage())
                    .build();
        }
    }
    
    /**
     * Get tournaments by user ID.
     */
    @GET
    @Path("/user/{userId}")
    public Response getTournamentsByUserId(@PathParam("userId") String userId) {
        try {
            List<TournamentDto> tournaments = tournamentService.getTournamentsByUserId(userId);
            return Response.ok(tournaments).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error retrieving tournaments for user: " + e.getMessage())
                    .build();
        }
    }
    
    /**
     * Health check endpoint for tournaments.
     */
    @GET
    @Path("/health")
    public Response healthCheck() {
        return Response.ok("Tournament service is healthy").build();
    }

    // ==================== TOURNAMENT PARTICIPANTS ====================

    /**
     * Get tournament participants.
     */
    @GET
    @Path("/{tournamentId}/participants")
    public Response getTournamentParticipants(@PathParam("tournamentId") String tournamentId) {
        try {
            List<Object> participants = tournamentService.getTournamentParticipants(tournamentId);
            return Response.ok(participants).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error retrieving participants: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Add tournament participant.
     */
    @POST
    @Path("/{tournamentId}/participants")
    public Response addTournamentParticipant(@PathParam("tournamentId") String tournamentId, Object participantData) {
        try {
            tournamentService.addTournamentParticipant(tournamentId, participantData);
            return Response.status(Response.Status.CREATED).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error adding participant: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Remove tournament participant.
     */
    @DELETE
    @Path("/{tournamentId}/participants/{participantId}")
    public Response removeTournamentParticipant(@PathParam("tournamentId") String tournamentId, @PathParam("participantId") String participantId) {
        try {
            tournamentService.removeTournamentParticipant(tournamentId, participantId);
            return Response.ok().build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error removing participant: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Update participant rating.
     */
    @PUT
    @Path("/{tournamentId}/participants/{participantId}/rating")
    public Response updateParticipantRating(@PathParam("tournamentId") String tournamentId, @PathParam("participantId") String participantId, Object ratingData) {
        try {
            // Parse rating from JSON
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            com.fasterxml.jackson.databind.JsonNode jsonNode = mapper.valueToTree(ratingData);
            Integer rating = jsonNode.get("rating").asInt();
            
            tournamentService.updateParticipantRating(tournamentId, participantId, rating);
            return Response.ok().build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error updating participant rating: " + e.getMessage())
                    .build();
        }
    }

    // ==================== TOURNAMENT GROUPS ====================

    /**
     * Get tournament groups.
     */
    @GET
    @Path("/{tournamentId}/groups")
    public Response getTournamentGroups(@PathParam("tournamentId") String tournamentId) {
        try {
            List<Object> groups = tournamentService.getTournamentGroups(tournamentId);
            return Response.ok(groups).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error retrieving groups: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Create tournament groups.
     */
    @POST
    @Path("/{tournamentId}/groups")
    public Response createTournamentGroups(@PathParam("tournamentId") String tournamentId, Object groupData) {
        try {
            List<Object> groups = tournamentService.createTournamentGroups(tournamentId, groupData);
            return Response.status(Response.Status.CREATED).entity(groups).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error creating groups: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Delete all tournament groups.
     */
    @DELETE
    @Path("/{tournamentId}/groups")
    public Response deleteAllTournamentGroups(@PathParam("tournamentId") String tournamentId) {
        try {
            tournamentService.deleteAllTournamentGroups(tournamentId);
            return Response.ok().build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error deleting groups: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Update a specific tournament group.
     */
    @PUT
    @Path("/{tournamentId}/groups/{groupId}")
    public Response updateTournamentGroup(@PathParam("tournamentId") String tournamentId, @PathParam("groupId") String groupId, Object groupData) {
        try {
            Object updatedGroup = tournamentService.updateTournamentGroup(tournamentId, groupId, groupData);
            return Response.ok(updatedGroup).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error updating group: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Delete a specific tournament group.
     */
    @DELETE
    @Path("/{tournamentId}/groups/{groupId}")
    public Response deleteTournamentGroup(@PathParam("tournamentId") String tournamentId, @PathParam("groupId") String groupId) {
        try {
            tournamentService.deleteTournamentGroup(tournamentId, groupId);
            return Response.ok().build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error deleting group: " + e.getMessage())
                    .build();
        }
    }

    // ==================== TOURNAMENT TEAMS ====================

    /**
     * Get all tournament teams.
     */
    @GET
    @Path("/{tournamentId}/teams")
    public Response getAllTournamentTeams(@PathParam("tournamentId") String tournamentId) {
        try {
            // TODO: Implement team retrieval
            return Response.ok().build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error retrieving teams: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Get tournament teams for a specific group.
     */
    @GET
    @Path("/{tournamentId}/groups/{groupId}/teams")
    public Response getTournamentTeams(@PathParam("tournamentId") String tournamentId, @PathParam("groupId") String groupId) {
        try {
            List<Object> teams = tournamentService.getTournamentTeams(tournamentId, groupId);
            return Response.ok(teams).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error retrieving teams: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Create tournament team.
     */
    @POST
    @Path("/{tournamentId}/groups/{groupId}/teams")
    public Response createTournamentTeam(@PathParam("tournamentId") String tournamentId, @PathParam("groupId") String groupId, Object teamData) {
        try {
            Object createdTeam = tournamentService.createTournamentTeam(tournamentId, groupId, teamData);
            return Response.status(Response.Status.CREATED)
                    .entity(createdTeam)
                    .build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error creating team: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Update tournament team.
     */
    @PUT
    @Path("/{tournamentId}/groups/{groupId}/teams/{teamId}")
    public Response updateTournamentTeam(@PathParam("tournamentId") String tournamentId, @PathParam("groupId") String groupId, @PathParam("teamId") String teamId, Object teamData) {
        try {
            Object updatedTeam = tournamentService.updateTournamentTeam(tournamentId, groupId, teamId, teamData);
            return Response.ok(updatedTeam).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error updating team: " + e.getMessage())
                    .build();
        }
    }

    // ==================== TOURNAMENT MATCHES ====================

    /**
     * Get tournament matches.
     */
    @GET
    @Path("/{tournamentId}/matches")
    public Response getTournamentMatches(@PathParam("tournamentId") String tournamentId) {
        try {
            List<Object> matches = tournamentService.getTournamentMatches(tournamentId);
            return Response.ok(matches).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error retrieving matches: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Update match score.
     */
    @PUT
    @Path("/matches/{matchId}")
    public Response updateMatchScore(@PathParam("matchId") String matchId, Object matchData) {
        System.out.println("=== MATCH UPDATE API CALLED ===");
        System.out.println("Match ID: " + matchId);
        System.out.println("Match Data: " + matchData);
        
        try {
            tournamentService.updateMatchScore(matchId, matchData);
            System.out.println("Match update successful");
            return Response.ok().build();
        } catch (Exception e) {
            System.err.println("=== MATCH UPDATE API ERROR ===");
            System.err.println("Error updating match: " + e.getMessage());
            e.printStackTrace();
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error updating match: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Generate all group matches for a tournament.
     */
    @POST
    @Path("/{tournamentId}/matches/generate")
    public Response generateAllGroupMatches(@PathParam("tournamentId") String tournamentId) {
        try {
            List<Object> generatedMatches = tournamentService.generateAllGroupMatches(tournamentId);
            return Response.status(Response.Status.CREATED).entity(generatedMatches).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error generating matches: " + e.getMessage())
                    .build();
        }
    }

    // ==================== TOURNAMENT STANDINGS ====================

    /**
     * Get standings for a tournament group.
     */
    @GET
    @Path("/{tournamentId}/groups/{groupId}/standings")
    public Response getTournamentStandings(@PathParam("tournamentId") String tournamentId, @PathParam("groupId") String groupId) {
        System.out.println("=== STANDINGS API CALLED ===");
        System.out.println("Tournament ID: " + tournamentId);
        System.out.println("Group ID: " + groupId);
        
        try {
            System.out.println("Getting standings for tournament: " + tournamentId + ", group: " + groupId);
            List<Object> standings = tournamentService.getTournamentStandings(tournamentId, groupId);
            System.out.println("Found " + standings.size() + " standings records");
            return Response.ok(standings).build();
        } catch (Exception e) {
            System.err.println("=== STANDINGS API ERROR ===");
            System.err.println("Error in getTournamentStandings: " + e.getMessage());
            e.printStackTrace();
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error retrieving standings: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Get all standings for a tournament.
     */
    @GET
    @Path("/{tournamentId}/standings")
    public Response getAllTournamentStandings(@PathParam("tournamentId") String tournamentId) {
        try {
            List<Object> standings = tournamentService.getAllTournamentStandings(tournamentId);
            return Response.ok(standings).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error retrieving standings: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Calculate and update standings for a tournament group.
     */
    @POST
    @Path("/{tournamentId}/groups/{groupId}/standings/calculate")
    public Response calculateStandings(@PathParam("tournamentId") String tournamentId, @PathParam("groupId") String groupId) {
        try {
            tournamentService.calculateAndUpdateStandings(tournamentId, groupId);
            return Response.ok().build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error calculating standings: " + e.getMessage())
                    .build();
        }
    }
} 