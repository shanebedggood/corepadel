package za.cf.cp.rules;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;
import java.util.UUID;

@Path("/api/rules")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class RulesResource {

    @Inject
    RulesService rulesService;

    /**
     * Get all padel rules sorted by order_number
     * @return List of all rules with their sections
     */
    @GET
    public Response getAllRules() {
        try {
            List<PadelRule> rules = rulesService.getAllRules();
            return Response.ok(rules).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error retrieving rules: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Get a single rule by ID
     * @param ruleId The rule ID
     * @return The rule with its sections
     */
    @GET
    @Path("/{ruleId}")
    public Response getRuleById(@PathParam("ruleId") String ruleId) {
        try {
            PadelRule rule = rulesService.getRuleById(UUID.fromString(ruleId));
            if (rule != null) {
                return Response.ok(rule).build();
            } else {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity("Rule not found")
                        .build();
            }
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Invalid rule ID format")
                    .build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error retrieving rule: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Create a new rule (admin only)
     * @param rule The rule to create
     * @return The created rule
     */
    @POST
    public Response createRule(PadelRule rule) {
        try {
            PadelRule createdRule = rulesService.createRule(rule);
            return Response.status(Response.Status.CREATED)
                    .entity(createdRule)
                    .build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error creating rule: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Update an existing rule (admin only)
     * @param ruleId The rule ID
     * @param rule The updated rule data
     * @return The updated rule
     */
    @PUT
    @Path("/{ruleId}")
    public Response updateRule(@PathParam("ruleId") String ruleId, PadelRule rule) {
        try {
            rule.setRuleId(UUID.fromString(ruleId));
            PadelRule updatedRule = rulesService.updateRule(rule);
            return Response.ok(updatedRule).build();
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Invalid rule ID format")
                    .build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error updating rule: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Delete a rule (admin only)
     * @param ruleId The rule ID
     * @return Success response
     */
    @DELETE
    @Path("/{ruleId}")
    public Response deleteRule(@PathParam("ruleId") String ruleId) {
        try {
            boolean deleted = rulesService.deleteRule(UUID.fromString(ruleId));
            if (deleted) {
                return Response.ok("Rule deleted successfully").build();
            } else {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity("Rule not found")
                        .build();
            }
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Invalid rule ID format")
                    .build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error deleting rule: " + e.getMessage())
                    .build();
        }
    }
}
