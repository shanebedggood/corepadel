package za.cf.cp.user.service;

import io.quarkus.panache.common.Sort;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import za.cf.cp.user.User;
import za.cf.cp.user.UserRole;
import za.cf.cp.user.UserClub;
import za.cf.cp.club.Club;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Service class for managing users in PostgreSQL.
 */
@ApplicationScoped
public class UserService {
    
    /**
     * Find a user by their Firebase UID
     */
    public Optional<User> findByFirebaseUid(String firebaseUid) {
        return User.find("firebaseUid", firebaseUid).firstResultOptional();
    }
    
    /**
     * Find a user by their email
     */
    public Optional<User> findByEmail(String email) {
        return User.find("email", email).firstResultOptional();
    }
    
    /**
     * Find a user by their username
     */
    public Optional<User> findByUsername(String username) {
        return User.find("username", username).firstResultOptional();
    }
    
    /**
     * Find a user by their UUID
     */
    public Optional<User> findById(UUID userId) {
        return User.findByIdOptional(userId);
    }
    
    /**
     * Get all users
     */
    public List<User> findAll() {
        return User.findAll().list();
    }
    
    /**
     * Get all users with pagination
     */
    public List<User> findAllWithPagination(int page, int size) {
        return User.findAll(Sort.by("userId").descending())
                .page(page, size)
                .list();
    }
    
    /**
     * Create a new user
     */
    @Transactional
    public User createUser(User user) {
        user.persist();
        return user;
    }
    
    /**
     * Update an existing user
     */
    @Transactional
    public User updateUser(User user) {
        User existingUser = User.findById(user.userId);
        if (existingUser == null) {
            throw new RuntimeException("User not found with ID: " + user.userId);
        }
        
        // Update fields
        existingUser.firstName = user.firstName;
        existingUser.lastName = user.lastName;
        existingUser.displayName = user.displayName;
        existingUser.mobile = user.mobile;
        existingUser.rating = user.rating;
        existingUser.profilePicture = user.profilePicture;
        existingUser.emailVerified = user.emailVerified;
        
        return existingUser;
    }
    
    /**
     * Delete a user
     */
    @Transactional
    public boolean deleteUser(UUID userId) {
        User user = User.findById(userId);
        if (user == null) {
            return false;
        }
        
        user.delete();
        return true;
    }
    
    /**
     * Add a role to a user
     */
    @Transactional
    public UserRole addRoleToUser(User user, String roleName) {
        // Check if user already has this role
        if (userHasRole(user.userId, roleName)) {
            // Return existing role instead of creating a new one
            return UserRole.find("user.userId = ?1 and roleName = ?2", user.userId, roleName).firstResult();
        }
        
        UserRole userRole = new UserRole(user, roleName);
        userRole.persist();
        return userRole;
    }
    
    /**
     * Remove a role from a user
     */
    @Transactional
    public boolean removeRoleFromUser(UUID userId, String roleName) {
        long deletedCount = UserRole.delete("user.userId = ?1 and roleName = ?2", userId, roleName);
        return deletedCount > 0;
    }
    
    /**
     * Get all roles for a user
     */
    public List<UserRole> getUserRoles(UUID userId) {
        return UserRole.find("user.userId", userId).list();
    }

    /**
     * Get all roles for a user by Firebase UID
     */
    public List<UserRole> getUserRolesByFirebaseUid(String firebaseUid) {
        return UserRole.find("user.firebaseUid", firebaseUid).list();
    }

    /**
     * Add a role to a user by Firebase UID
     * Note: User creation is now handled automatically by Lambda trigger on email confirmation.
     * This method is only for role assignment to existing users.
     */
    @Transactional
    public UserRole addRoleToUserByFirebaseUid(String firebaseUid, String roleName) {
        Optional<User> userOpt = findByFirebaseUid(firebaseUid);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found with Firebase UID: " + firebaseUid);
        }
        
        User user = userOpt.get();
        return addRoleToUser(user, roleName);
    }
    
    /**
     * Add a user to a club
     */
    @Transactional
    public UserClub addUserToClub(User user, Club club, String role) {
        UserClub userClub = new UserClub(user, club, role);
        userClub.persist();
        return userClub;
    }
    
    /**
     * Remove a user from a club
     */
    @Transactional
    public boolean removeUserFromClub(UUID userId, UUID clubId) {
        long deletedCount = UserClub.delete("user.userId = ?1 and club.clubId = ?2", userId, clubId);
        return deletedCount > 0;
    }
    
    /**
     * Get all clubs for a user
     */
    public List<UserClub> getUserClubs(UUID userId) {
        return UserClub.find("user.userId", userId).list();
    }
    
    /**
     * Get all users in a club
     */
    public List<UserClub> getClubUsers(UUID clubId) {
        return UserClub.find("club.clubId", clubId).list();
    }
    
    /**
     * Check if a user has a specific role
     */
    public boolean userHasRole(UUID userId, String roleName) {
        long count = UserRole.count("user.userId = ?1 and roleName = ?2", userId, roleName);
        return count > 0;
    }
    
    /**
     * Check if a user is a member of a specific club
     */
    public boolean userIsClubMember(UUID userId, UUID clubId) {
        long count = UserClub.count("user.userId = ?1 and club.clubId = ?2", userId, clubId);
        return count > 0;
    }
    
    /**
     * Get user's role in a specific club
     */
    public Optional<String> getUserClubRole(UUID userId, UUID clubId) {
        return UserClub.find("user.userId = ?1 and club.clubId = ?2", userId, clubId)
                .firstResultOptional()
                .map(userClub -> ((za.cf.cp.user.UserClub) userClub).getRole());
    }
    
    /**
     * Search users by name, email, or username
     */
    public List<User> searchUsers(String searchTerm) {
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return findAll();
        }
        
        String trimmedSearchTerm = "%" + searchTerm.trim().toLowerCase() + "%";
        
        return User.find(
            "LOWER(firstName) LIKE ?1 OR LOWER(lastName) LIKE ?1 OR LOWER(displayName) LIKE ?1 OR LOWER(email) LIKE ?1 OR LOWER(username) LIKE ?1",
            trimmedSearchTerm
        ).list();
    }
} 