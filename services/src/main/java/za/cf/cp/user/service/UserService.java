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
 * Uses firebase_uid as the primary identifier.
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
        user.persist();
        return user;
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
        
        User user = userOpt.get();
        UserRole userRole = new UserRole(user, roleName);
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
    public UserClub addUserToClub(String firebaseUid, UUID clubId, String role) {
        Optional<User> userOpt = findByFirebaseUid(firebaseUid);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found with Firebase UID: " + firebaseUid);
        }
        
        Club club = Club.findById(clubId);
        if (club == null) {
            throw new RuntimeException("Club not found with ID: " + clubId);
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