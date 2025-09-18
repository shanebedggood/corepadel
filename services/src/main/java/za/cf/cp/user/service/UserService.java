package za.cf.cp.user.service;

import io.quarkus.panache.common.Sort;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import za.cf.cp.user.User;
import za.cf.cp.user.UserRole;
import za.cf.cp.user.Role;
import za.cf.cp.user.UserClub;
import za.cf.cp.club.Club;
import za.cf.cp.user.dto.CachedUserData;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Service class for managing users in PostgreSQL.
 * Uses firebase_uid as the primary identifier.
 */
@ApplicationScoped
public class UserService {
    
    @Inject
    UserAuthCacheService userAuthCacheService;
    
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
     * Find a user by their Firebase UID (alias for findByFirebaseUid)
     */
    public Optional<User> findById(String firebaseUid) {
        return findByFirebaseUid(firebaseUid);
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
        return User.findAll(Sort.by("firebaseUid").descending())
                .page(page, size)
                .list();
    }
    
    /**
     * Create a new user
     */
    @Transactional
    public User createUser(User user) {
        // Validate required fields
        if (user.firebaseUid == null || user.firebaseUid.trim().isEmpty()) {
            throw new RuntimeException("Firebase UID is required");
        }
        if (user.email == null || user.email.trim().isEmpty()) {
            throw new RuntimeException("Email is required");
        }
        if (user.username == null || user.username.trim().isEmpty()) {
            throw new RuntimeException("Username is required");
        }
        
        // Apply sensible defaults
        if (user.displayName == null || user.displayName.trim().isEmpty()) {
            user.displayName = user.username;
        }
        if ((user.firstName == null || user.firstName.isBlank()) && (user.lastName == null || user.lastName.isBlank())) {
            // Derive first/last from displayName if possible (split on first space)
            String dn = user.displayName != null ? user.displayName.trim() : "";
            int spaceIdx = dn.indexOf(' ');
            if (spaceIdx > 0) {
                user.firstName = dn.substring(0, spaceIdx).trim();
                user.lastName = dn.substring(spaceIdx + 1).trim();
            } else {
                user.firstName = dn; // put all in first name
            }
        }
        if (user.rating == null) {
            user.rating = 0;
        }
        if (user.emailVerified == null) {
            user.emailVerified = false;
        }
        if (user.interests == null) {
            user.interests = new String[0];
        }
        if (user.profileCompleted == null) {
            user.profileCompleted = false;
        }
        
        // Ensure username is unique by appending a suffix if needed
        String baseUsername = user.username;
        String uniqueUsername = baseUsername;
        int suffix = 1;
        
        while (findByUsername(uniqueUsername).isPresent()) {
            uniqueUsername = baseUsername + suffix;
            suffix++;
        }
        user.username = uniqueUsername;
        
        user.persist();
        
        // Assign default role 'player' if no roles exist yet
        assignDefaultPlayerRole(user.firebaseUid);
        
        return user;
    }
    
    private void assignDefaultPlayerRole(String firebaseUid) {
        try {
            // Check if user already has any role
            List<UserRole> roles = UserRole.find("user.firebaseUid", firebaseUid).list();
            
            if (roles == null || roles.isEmpty()) {
                Optional<User> userOpt = findByFirebaseUid(firebaseUid);
                if (userOpt.isPresent()) {
                    // Find the 'player' role from the role table
                    Role playerRole = Role.find("roleName", "player").firstResult();
                    if (playerRole == null) {
                        System.err.println("❌ 'player' role not found in role table");
                        return;
                    }
                    
                    UserRole userRole = new UserRole(userOpt.get(), playerRole);
                    userRole.persist();
                }
            }
        } catch (Exception e) {
            System.err.println("❌ Error creating default role: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    /**
     * Update an existing user
     */
    @Transactional
    public User updateUser(User user) {
        User existingUser = User.findById(user.firebaseUid);
        if (existingUser == null) {
            throw new RuntimeException("User not found with Firebase UID: " + user.firebaseUid);
        }
        
        // Update fields
        existingUser.firstName = user.firstName;
        existingUser.lastName = user.lastName;
        existingUser.displayName = user.displayName;
        existingUser.mobile = user.mobile;
        existingUser.rating = user.rating;
        existingUser.profilePicture = user.profilePicture;
        existingUser.emailVerified = user.emailVerified;
        if (user.interests != null) existingUser.interests = user.interests;
        if (user.profileCompleted != null) existingUser.profileCompleted = user.profileCompleted;
        existingUser.playtomicRating = user.playtomicRating;
        
        return existingUser;
    }
    
    /**
     * Delete a user
     */
    @Transactional
    public boolean deleteUser(String firebaseUid) {
        User user = User.findById(firebaseUid);
        if (user != null) {
            user.delete();
            return true;
        }
        return false;
    }
    
    /**
     * Get user roles by Firebase UID
     */
    public List<UserRole> getUserRoles(String firebaseUid) {
        return UserRole.find("user.firebaseUid", firebaseUid).list();
    }
    
    /**
     * Get user roles by Firebase UID (alias for getUserRoles)
     */
    public List<UserRole> getUserRolesByFirebaseUid(String firebaseUid) {
        return getUserRoles(firebaseUid);
    }
    
    /**
     * Add role to user
     */
    @Transactional
    public UserRole addRoleToUser(String firebaseUid, String roleName) {
        Optional<User> userOpt = findByFirebaseUid(firebaseUid);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found with Firebase UID: " + firebaseUid);
        }
        
        // Find the role from the role table
        Role role = Role.find("roleName", roleName).firstResult();
        if (role == null) {
            throw new RuntimeException("Role not found: " + roleName);
        }
        
        User user = userOpt.get();
        UserRole userRole = new UserRole(user, role);
        userRole.persist();
        return userRole;
    }
    
    /**
     * Add role to user by Firebase UID (alias for addRoleToUser)
     */
    @Transactional
    public UserRole addRoleToUserByFirebaseUid(String firebaseUid, String roleName) {
        return addRoleToUser(firebaseUid, roleName);
    }
    
    /**
     * Remove role from user
     */
    @Transactional
    public boolean removeRoleFromUser(String firebaseUid, String roleName) {
        List<UserRole> userRoles = UserRole.find("user.firebaseUid = ?1 and roleName = ?2", firebaseUid, roleName).list();
        if (!userRoles.isEmpty()) {
            userRoles.get(0).delete();
            return true;
        }
        return false;
    }
    
    /**
     * Get user club memberships by Firebase UID
     */
    public List<UserClub> getUserClubs(String firebaseUid) {
        return UserClub.find("user.firebaseUid", firebaseUid).list();
    }
    
    /**
     * Add user to club
     */
    @Transactional
    public UserClub addUserToClub(String firebaseUid, UUID clubId, String roleName) {
        Optional<User> userOpt = findByFirebaseUid(firebaseUid);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found with Firebase UID: " + firebaseUid);
        }
        
        Club club = Club.findById(clubId);
        if (club == null) {
            throw new RuntimeException("Club not found with ID: " + clubId);
        }
        
        // Find the role by name
        Role role = Role.find("roleName", roleName).firstResult();
        if (role == null) {
            throw new RuntimeException("Role not found: " + roleName);
        }
        
        User user = userOpt.get();
        UserClub userClub = new UserClub(user, club, role);
        userClub.persist();
        return userClub;
    }
    
    /**
     * Remove user from club
     */
    @Transactional
    public boolean removeUserFromClub(String firebaseUid, UUID clubId) {
        List<UserClub> userClubs = UserClub.find("user.firebaseUid = ?1 and club.clubId = ?2", firebaseUid, clubId).list();
        if (!userClubs.isEmpty()) {
            userClubs.get(0).delete();
            return true;
        }
        return false;
    }
    
    /**
     * Get club admins by club ID
     */
    public List<UserClub> getClubAdmins(UUID clubId) {
        return UserClub.find("club.clubId = ?1 and role.roleName in ('admin', 'owner')", clubId).list();
    }
    
    
    /**
     * Get user's club memberships with roles
     */
    public List<UserClub> getUserClubMemberships(String firebaseUid) {
        return UserClub.find("user.firebaseUid = ?1", firebaseUid).list();
    }
    
    /**
     * Get cached user authentication data (roles and club memberships)
     */
    public CachedUserData getCachedUserData(String firebaseUid) {
        return userAuthCacheService.getCachedUserData(firebaseUid);
    }
    
    /**
     * Check if user has a specific role (using cache)
     */
    public boolean hasRole(String firebaseUid, String roleName) {
        return userAuthCacheService.hasRole(firebaseUid, roleName);
    }
    
    /**
     * Check if user is admin of a specific club (using cache)
     */
    public boolean isUserClubAdmin(String firebaseUid, UUID clubId) {
        return userAuthCacheService.isAdminOfClub(firebaseUid, clubId);
    }
    
    /**
     * Get all clubs where user is admin (using cache)
     */
    public List<CachedUserData.ClubMembership> getAdminClubs(String firebaseUid) {
        return userAuthCacheService.getAdminClubs(firebaseUid);
    }
    
    /**
     * Get all club memberships for user (using cache)
     */
    public List<CachedUserData.ClubMembership> getCachedClubMemberships(String firebaseUid) {
        return userAuthCacheService.getClubMemberships(firebaseUid);
    }
    
    /**
     * Invalidate user cache (call when user data changes)
     */
    public void invalidateUserCache(String firebaseUid) {
        userAuthCacheService.invalidateUserCache(firebaseUid);
    }
    
    /**
     * Check if user exists by Firebase UID
     */
    public boolean existsByFirebaseUid(String firebaseUid) {
        return User.count("firebaseUid", firebaseUid) > 0;
    }
    
    /**
     * Check if user exists by email
     */
    public boolean existsByEmail(String email) {
        return User.count("email", email) > 0;
    }
    
    /**
     * Check if user exists by username
     */
    public boolean existsByUsername(String username) {
        return User.count("username", username) > 0;
    }
    
    /**
     * Search users by name, email, or username
     */
    public List<User> searchUsers(String searchTerm) {
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return findAll();
        }
        
        String trimmedSearchTerm = "%" + searchTerm.trim().toLowerCase() + "%";
        
        return User.find("""
            LOWER(firstName) LIKE ?1 OR 
            LOWER(lastName) LIKE ?1 OR 
            LOWER(displayName) LIKE ?1 OR 
            LOWER(email) LIKE ?1 OR 
            LOWER(username) LIKE ?1
            """, trimmedSearchTerm).list();
    }
} 