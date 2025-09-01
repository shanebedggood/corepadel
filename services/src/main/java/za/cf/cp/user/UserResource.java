package za.cf.cp.user;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import za.cf.cp.user.service.UserService;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * REST resource for managing users.
 */
@Path("/api/users")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class UserResource {
    
    @Inject
    UserService userService;
    
    /**
     * Get all active users
     */
    @GET
    public Response getAllUsers() {
        try {
            List<User> users = userService.findAll();
            return Response.ok(users).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error retrieving users: " + e.getMessage())
                    .build();
        }
    }
    
    /**
     * Get users with pagination
     */
    @GET
    @Path("/page/{page}/size/{size}")
    public Response getUsersWithPagination(@PathParam("page") int page, @PathParam("size") int size) {
        try {
            List<User> users = userService.findAllWithPagination(page, size);
            return Response.ok(users).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error retrieving users: " + e.getMessage())
                    .build();
        }
    }
    
    /**
     * Get a user by Firebase UID
     */
    @GET
    @Path("/firebase/{firebaseUid}")
    public Response getUserByFirebaseUid(@PathParam("firebaseUid") String firebaseUid) {
        try {
            Optional<User> user = userService.findByFirebaseUid(firebaseUid);
            
            if (user.isPresent()) {
                return Response.ok(user.get()).build();
            } else {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity("User not found with Firebase UID: " + firebaseUid)
                        .build();
            }
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error retrieving user: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Update user profile by Firebase UID
     */
    @PUT
    @Path("/firebase/{firebaseUid}/profile")
    public Response updateUserProfileByFirebaseUid(@PathParam("firebaseUid") String firebaseUid, User profileData) {
        try {
            Optional<User> existingUser = userService.findByFirebaseUid(firebaseUid);
            if (!existingUser.isPresent()) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity("User not found with Firebase UID: " + firebaseUid)
                        .build();
            }

            User user = existingUser.get();
            
            // Update profile fields
            if (profileData.firstName != null) user.firstName = profileData.firstName;
            if (profileData.lastName != null) user.lastName = profileData.lastName;
            if (profileData.displayName != null) user.displayName = profileData.displayName;
            if (profileData.mobile != null) user.mobile = profileData.mobile;
            if (profileData.rating != null) user.rating = profileData.rating;
            if (profileData.profilePicture != null) user.profilePicture = profileData.profilePicture;
            if (profileData.emailVerified != null) user.emailVerified = profileData.emailVerified;
            if (profileData.interests != null) user.interests = profileData.interests;
            if (profileData.profileCompleted != null) user.profileCompleted = profileData.profileCompleted;
            
            User updatedUser = userService.updateUser(user);
            return Response.ok(updatedUser).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error updating user profile: " + e.getMessage())
                    .build();
        }
    }
    
    /**
     * Get a user by email
     */
    @GET
    @Path("/email/{email}")
    public Response getUserByEmail(@PathParam("email") String email) {
        try {
            Optional<User> user = userService.findByEmail(email);
            
            if (user.isPresent()) {
                return Response.ok(user.get()).build();
            } else {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity("User not found with email: " + email)
                        .build();
            }
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error retrieving user: " + e.getMessage())
                    .build();
        }
    }
    
    /**
     * Search users by name, email, or username
     */
    @GET
    @Path("/search")
    public Response searchUsers(@QueryParam("q") String searchTerm) {
        try {
            List<User> users = userService.searchUsers(searchTerm);
            return Response.ok(users).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error searching users: " + e.getMessage())
                    .build();
        }
    }
    
    /**
     * Create a new user
     */
    @POST
    public Response createUser(User user) {
        try {
            // Check if user already exists
            Optional<User> existingUser = userService.findByFirebaseUid(user.firebaseUid);
            if (existingUser.isPresent()) {
                return Response.status(Response.Status.CONFLICT)
                        .entity("User already exists with Firebase UID: " + user.firebaseUid)
                        .build();
            }
            
            User createdUser = userService.createUser(user);
            return Response.status(Response.Status.CREATED).entity(createdUser).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error creating user: " + e.getMessage())
                    .build();
        }
    }
    

    

    


    /**
     * Get all roles for a user by Firebase UID
     */
    @GET
    @Path("/firebase/{firebaseUid}/roles")
    public Response getUserRolesByFirebaseUid(@PathParam("firebaseUid") String firebaseUid) {
        try {
            List<za.cf.cp.user.UserRole> roles = userService.getUserRolesByFirebaseUid(firebaseUid);
            return Response.ok(roles).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error retrieving user roles: " + e.getMessage())
                    .build();
        }
    }
    


    /**
     * Add a role to a user by Firebase UID
     */
    @POST
    @Path("/firebase/{firebaseUid}/roles")
    public Response addRoleToUserByFirebaseUid(@PathParam("firebaseUid") String firebaseUid, @QueryParam("role") String roleName) {
        try {
            za.cf.cp.user.UserRole userRole = userService.addRoleToUserByFirebaseUid(firebaseUid, roleName);
            return Response.status(Response.Status.CREATED).entity(userRole).build();
        } catch (RuntimeException e) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(e.getMessage())
                    .build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error adding role to user: " + e.getMessage())
                    .build();
        }
    }
    

    

    
    /**
     * Get user clubs by Firebase UID
     */
    @GET
    @Path("/firebase/{firebaseUid}/clubs")
    public Response getUserClubsByFirebaseUid(@PathParam("firebaseUid") String firebaseUid) {
        try {
            Optional<User> user = userService.findByFirebaseUid(firebaseUid);
            if (user.isEmpty()) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity("User not found with Firebase UID: " + firebaseUid)
                        .build();
            }
            
            List<za.cf.cp.user.UserClub> userClubs = userService.getUserClubs(user.get().firebaseUid);
            return Response.ok(userClubs).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error retrieving user clubs: " + e.getMessage())
                    .build();
        }
    }
    

    

    
    /**
     * Health check endpoint
     */
    @GET
    @Path("/health")
    public Response health() {
        return Response.ok("User service is healthy").build();
    }
} 