package za.cf.cp.courtschedule;

import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.jboss.logging.Logger;
import za.cf.cp.courtschedule.dto.CreateCourtScheduleRequest;
import za.cf.cp.courtschedule.service.CourtScheduleService;

@Path("/api/court-schedules")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class CourtScheduleResource {

    private static final Logger LOG = Logger.getLogger(CourtScheduleResource.class);

    @Inject
    CourtScheduleService service;

    @GET
    public Response getAllSchedules() {
        try {
            LOG.info("Fetching all court schedules");
            var schedules = service.getAllSchedules();
            LOG.info("Successfully fetched " + schedules.size() + " court schedules");
            return Response.ok(schedules).build();
        } catch (Exception e) {
            LOG.error("Error fetching court schedules: " + e.getMessage(), e);
            var errorResponse = new java.util.HashMap<String, Object>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error fetching court schedules: " + e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(errorResponse).build();
        }
    }

    @GET
    @Path("/club/{clubId}/available-slots")
    public Response getAvailableSlots(
            @PathParam("clubId") String clubId,
            @jakarta.ws.rs.QueryParam("startDate") String startDate,
            @jakarta.ws.rs.QueryParam("endDate") String endDate) {
        try {
            LOG.info("Fetching available slots for club: " + clubId + " from " + startDate + " to " + endDate);
            
            if (startDate == null || endDate == null) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(java.util.Map.of("success", false, "message", "startDate and endDate are required"))
                        .build();
            }
            
            var availableSlots = service.getAvailableSlots(clubId, startDate, endDate);
            
            LOG.info("Successfully fetched available slots: " + availableSlots.size());
            return Response.ok(availableSlots).build();
        } catch (Exception e) {
            LOG.error("Error fetching available slots: " + e.getMessage(), e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(java.util.Map.of("success", false, "message", "Error fetching available slots"))
                    .build();
        }
    }

    @GET
    @Path("/{id}")
    public Response getById(@PathParam("id") String id) {
        try {
            LOG.info("Fetching court schedule by id: " + id);
            var schedule = CourtSchedule.findByIdOptional(java.util.UUID.fromString(id));
            if (schedule.isEmpty()) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity(java.util.Map.of("success", false, "message", "Schedule not found"))
                        .build();
            }
            return Response.ok(schedule.get()).build();
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(java.util.Map.of("success", false, "message", "Invalid id format"))
                    .build();
        } catch (Exception e) {
            LOG.error("Error fetching court schedule: " + e.getMessage(), e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(java.util.Map.of("success", false, "message", "Error fetching court schedule"))
                    .build();
        }
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public Response deleteSchedule(@PathParam("id") String id) {
        try {
            LOG.info("Deleting court schedule with id: " + id);
            var schedule = CourtSchedule.findByIdOptional(java.util.UUID.fromString(id));
            if (schedule.isEmpty()) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity(java.util.Map.of("success", false, "message", "Schedule not found"))
                        .build();
            }
            
            // Delete the schedule (cascade will handle schedule days)
            ((CourtSchedule) schedule.get()).delete();
            LOG.info("Successfully deleted court schedule: " + id);
            
            return Response.ok(java.util.Map.of("success", true, "message", "Schedule deleted successfully")).build();
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(java.util.Map.of("success", false, "message", "Invalid id format"))
                    .build();
        } catch (Exception e) {
            LOG.error("Error deleting court schedule: " + e.getMessage(), e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(java.util.Map.of("success", false, "message", "Error deleting court schedule"))
                    .build();
        }
    }

    @PUT
    @Path("/{id}")
    @Transactional
    public Response updateSchedule(@PathParam("id") String id, CreateCourtScheduleRequest request) {
        try {
            LOG.info("Updating court schedule with id: " + id);
            
            if (request == null) {
                var errorResponse = new java.util.HashMap<String, Object>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Request body is required");
                return Response.status(Response.Status.BAD_REQUEST).entity(errorResponse).build();
            }
            
            if (request.clubId == null || request.clubId.trim().isEmpty()) {
                var errorResponse = new java.util.HashMap<String, Object>();
                errorResponse.put("success", false);
                errorResponse.put("message", "clubId is required");
                return Response.status(Response.Status.BAD_REQUEST).entity(errorResponse).build();
            }
            
            if (request.startDate == null || request.endDate == null) {
                var errorResponse = new java.util.HashMap<String, Object>();
                errorResponse.put("success", false);
                errorResponse.put("message", "startDate and endDate are required");
                return Response.status(Response.Status.BAD_REQUEST).entity(errorResponse).build();
            }
            
            if (request.scheduleDays == null || request.scheduleDays.isEmpty()) {
                var errorResponse = new java.util.HashMap<String, Object>();
                errorResponse.put("success", false);
                errorResponse.put("message", "At least one schedule day is required");
                return Response.status(Response.Status.BAD_REQUEST).entity(errorResponse).build();
            }
            
            // Check if schedule exists
            var existingSchedule = CourtSchedule.findByIdOptional(java.util.UUID.fromString(id));
            if (existingSchedule.isEmpty()) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity(java.util.Map.of("success", false, "message", "Schedule not found"))
                        .build();
            }
            
            var updated = service.update(java.util.UUID.fromString(id), request);
            LOG.info("Successfully updated court schedule: " + id);
            
            // Create a response object that matches what the frontend expects
            var response = new java.util.HashMap<String, Object>();
            response.put("success", true);
            response.put("message", "Court schedule updated successfully");
            response.put("schedule", updated);
            
            return Response.ok(response).build();
        } catch (IllegalArgumentException e) {
            LOG.error("Invalid request data: " + e.getMessage(), e);
            var errorResponse = new java.util.HashMap<String, Object>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Invalid request data: " + e.getMessage());
            return Response.status(Response.Status.BAD_REQUEST).entity(errorResponse).build();
        } catch (Exception e) {
            LOG.error("Error updating court schedule: " + e.getMessage(), e);
            var errorResponse = new java.util.HashMap<String, Object>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error updating court schedule: " + e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(errorResponse).build();
        }
    }

    @POST
    public Response create(CreateCourtScheduleRequest request) {
        try {
            LOG.info("Received court schedule request: " + request);
            
            if (request == null) {
                var errorResponse = new java.util.HashMap<String, Object>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Request body is required");
                return Response.status(Response.Status.BAD_REQUEST).entity(errorResponse).build();
            }
            
            if (request.clubId == null || request.clubId.trim().isEmpty()) {
                var errorResponse = new java.util.HashMap<String, Object>();
                errorResponse.put("success", false);
                errorResponse.put("message", "clubId is required");
                return Response.status(Response.Status.BAD_REQUEST).entity(errorResponse).build();
            }
            
            if (request.startDate == null || request.endDate == null) {
                var errorResponse = new java.util.HashMap<String, Object>();
                errorResponse.put("success", false);
                errorResponse.put("message", "startDate and endDate are required");
                return Response.status(Response.Status.BAD_REQUEST).entity(errorResponse).build();
            }
            
            if (request.scheduleDays == null || request.scheduleDays.isEmpty()) {
                var errorResponse = new java.util.HashMap<String, Object>();
                errorResponse.put("success", false);
                errorResponse.put("message", "At least one schedule day is required");
                return Response.status(Response.Status.BAD_REQUEST).entity(errorResponse).build();
            }
            
            var saved = service.create(request);
            LOG.info("Successfully created court schedule: " + saved.scheduleId);
            
            // Create a response object that matches what the frontend expects
            var response = new java.util.HashMap<String, Object>();
            response.put("success", true);
            response.put("message", "Court schedule created successfully");
            response.put("schedule", saved);
            
            return Response.status(Response.Status.CREATED).entity(response).build();
        } catch (IllegalArgumentException e) {
            LOG.error("Invalid request data: " + e.getMessage(), e);
            var errorResponse = new java.util.HashMap<String, Object>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Invalid request data: " + e.getMessage());
            return Response.status(Response.Status.BAD_REQUEST).entity(errorResponse).build();
        } catch (Exception e) {
            LOG.error("Error creating court schedule: " + e.getMessage(), e);
            var errorResponse = new java.util.HashMap<String, Object>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error creating court schedule: " + e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(errorResponse).build();
        }
    }
}


