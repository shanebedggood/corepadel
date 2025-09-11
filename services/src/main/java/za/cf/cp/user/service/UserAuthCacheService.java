package za.cf.cp.user.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import za.cf.cp.user.User;
import za.cf.cp.user.UserRole;
import za.cf.cp.user.UserClub;
import za.cf.cp.user.dto.CachedUserData;
import za.cf.cp.user.dto.CachedUserData.ClubMembership;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * Service for caching user authentication data including roles and club memberships.
 * This helps avoid repeated database queries for user permissions.
 */
@ApplicationScoped
public class UserAuthCacheService {
    
    @Inject
    UserService userService;
    
    // In-memory cache - in production, consider using Redis or similar
    private final Map<String, CachedUserData> userCache = new ConcurrentHashMap<>();
    
    // Cache expiration time in hours
    private static final int CACHE_EXPIRATION_HOURS = 1;
    
    /**
     * Get cached user data or fetch from database if not cached or expired
     */
    public CachedUserData getCachedUserData(String firebaseUid) {
        CachedUserData cachedData = userCache.get(firebaseUid);
        
        if (cachedData == null || cachedData.isExpired()) {
            // Cache miss or expired, fetch from database
            cachedData = fetchAndCacheUserData(firebaseUid);
        }
        
        return cachedData;
    }
    
    /**
     * Fetch user data from database and cache it
     */
    private CachedUserData fetchAndCacheUserData(String firebaseUid) {
        // Get user basic info
        User user = userService.findByFirebaseUid(firebaseUid)
                .orElseThrow(() -> new RuntimeException("User not found: " + firebaseUid));
        
        // Get user roles
        List<String> roles = getUserRoles(firebaseUid);
        
        // Get user club memberships
        List<ClubMembership> clubMemberships = getUserClubMemberships(firebaseUid);
        
        // Create cached data
        CachedUserData cachedData = new CachedUserData(
                user.firebaseUid,
                user.email,
                user.username,
                user.displayName,
                roles,
                clubMemberships
        );
        
        // Cache the data
        userCache.put(firebaseUid, cachedData);
        
        return cachedData;
    }
    
    /**
     * Get user roles from database
     */
    private List<String> getUserRoles(String firebaseUid) {
        List<UserRole> userRoles = UserRole.find("user.firebaseUid", firebaseUid).list();
        return userRoles.stream()
                .map(userRole -> userRole.getRole().roleName)
                .collect(Collectors.toList());
    }
    
    /**
     * Get user club memberships from database
     */
    private List<ClubMembership> getUserClubMemberships(String firebaseUid) {
        List<UserClub> userClubs = UserClub.find("user.firebaseUid", firebaseUid).list();
                
        List<ClubMembership> memberships = userClubs.stream()
                .map(userClub -> new ClubMembership(
                        userClub.getClub().clubId,
                        userClub.getClub().name,
                        userClub.getRole().roleName,
                        isAdminRole(userClub.getRole().roleName)
                ))
                .collect(Collectors.toList());
        
        return memberships;
    }
    
    /**
     * Check if a role is an admin role
     */
    private boolean isAdminRole(String roleName) {
        return "admin".equals(roleName) || "owner".equals(roleName);
    }
    
    /**
     * Check if user has a specific role (using cache)
     */
    public boolean hasRole(String firebaseUid, String roleName) {
        CachedUserData cachedData = getCachedUserData(firebaseUid);
        return cachedData.hasRole(roleName);
    }
    
    /**
     * Check if user is admin of a specific club (using cache)
     */
    public boolean isAdminOfClub(String firebaseUid, UUID clubId) {
        CachedUserData cachedData = getCachedUserData(firebaseUid);        
        boolean result = cachedData.isAdminOfClub(clubId);
        return result;
    }
    
    /**
     * Get all clubs where user is admin (using cache)
     */
    public List<ClubMembership> getAdminClubs(String firebaseUid) {
        CachedUserData cachedData = getCachedUserData(firebaseUid);
        return cachedData.getAdminClubs();
    }
    
    /**
     * Get all club memberships for user (using cache)
     */
    public List<ClubMembership> getClubMemberships(String firebaseUid) {
        CachedUserData cachedData = getCachedUserData(firebaseUid);
        return cachedData.getClubMemberships();
    }
    
    /**
     * Invalidate cache for a specific user
     */
    public void invalidateUserCache(String firebaseUid) {
        userCache.remove(firebaseUid);
    }
    
    /**
     * Clear all cached data
     */
    public void clearAllCache() {
        userCache.clear();
    }
    
    /**
     * Get cache statistics
     */
    public Map<String, Object> getCacheStats() {
        Map<String, Object> stats = new ConcurrentHashMap<>();
        stats.put("totalCachedUsers", userCache.size());
        stats.put("cacheExpirationHours", CACHE_EXPIRATION_HOURS);
        
        // Count expired entries
        long expiredCount = userCache.values().stream()
                .mapToLong(cachedData -> cachedData.isExpired() ? 1 : 0)
                .sum();
        stats.put("expiredEntries", expiredCount);
        
        return stats;
    }
    
    /**
     * Clean up expired entries from cache
     */
    public void cleanupExpiredEntries() {
        userCache.entrySet().removeIf(entry -> entry.getValue().isExpired());
    }
}
