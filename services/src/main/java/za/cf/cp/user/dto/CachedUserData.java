package za.cf.cp.user.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * DTO representing cached user authentication data including roles and club memberships.
 * This is used to avoid repeated database queries for user permissions.
 */
public class CachedUserData {
    
    @JsonProperty("firebase_uid")
    public String firebaseUid;
    
    @JsonProperty("email")
    public String email;
    
    @JsonProperty("username")
    public String username;
    
    @JsonProperty("display_name")
    public String displayName;
    
    @JsonProperty("roles")
    public List<String> roles;
    
    @JsonProperty("club_memberships")
    public List<ClubMembership> clubMemberships;
    
    @JsonProperty("cached_at")
    public LocalDateTime cachedAt;
    
    @JsonProperty("expires_at")
    public LocalDateTime expiresAt;
    
    // Default constructor
    public CachedUserData() {}
    
    // Constructor with essential fields
    public CachedUserData(String firebaseUid, String email, String username, String displayName, 
                         List<String> roles, List<ClubMembership> clubMemberships) {
        this.firebaseUid = firebaseUid;
        this.email = email;
        this.username = username;
        this.displayName = displayName;
        this.roles = roles;
        this.clubMemberships = clubMemberships;
        this.cachedAt = LocalDateTime.now();
        this.expiresAt = LocalDateTime.now().plusHours(1); // Cache for 1 hour
    }
    
    // Inner class for club membership data
    public static class ClubMembership {
        @JsonProperty("club_id")
        public UUID clubId;
        
        @JsonProperty("club_name")
        public String clubName;
        
        @JsonProperty("role")
        public String role;
        
        @JsonProperty("is_admin")
        public boolean isAdmin;
        
        // Default constructor
        public ClubMembership() {}
        
        // Constructor with fields
        public ClubMembership(UUID clubId, String clubName, String role, boolean isAdmin) {
            this.clubId = clubId;
            this.clubName = clubName;
            this.role = role;
            this.isAdmin = isAdmin;
        }
        
        // Getters and setters
        public UUID getClubId() {
            return clubId;
        }
        
        public void setClubId(UUID clubId) {
            this.clubId = clubId;
        }
        
        public String getClubName() {
            return clubName;
        }
        
        public void setClubName(String clubName) {
            this.clubName = clubName;
        }
        
        public String getRole() {
            return role;
        }
        
        public void setRole(String role) {
            this.role = role;
        }
        
        public boolean isAdmin() {
            return isAdmin;
        }
        
        public void setAdmin(boolean admin) {
            isAdmin = admin;
        }
    }
    
    // Getters and setters
    public String getFirebaseUid() {
        return firebaseUid;
    }
    
    public void setFirebaseUid(String firebaseUid) {
        this.firebaseUid = firebaseUid;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }
    
    public List<String> getRoles() {
        return roles;
    }
    
    public void setRoles(List<String> roles) {
        this.roles = roles;
    }
    
    public List<ClubMembership> getClubMemberships() {
        return clubMemberships;
    }
    
    public void setClubMemberships(List<ClubMembership> clubMemberships) {
        this.clubMemberships = clubMemberships;
    }
    
    public LocalDateTime getCachedAt() {
        return cachedAt;
    }
    
    public void setCachedAt(LocalDateTime cachedAt) {
        this.cachedAt = cachedAt;
    }
    
    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }
    
    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }
    
    // Utility methods
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }
    
    public boolean hasRole(String roleName) {
        return roles != null && roles.contains(roleName);
    }
    
    public boolean isAdminOfClub(UUID clubId) {
        if (clubMemberships == null) {
            return false;
        }
        return clubMemberships.stream()
                .anyMatch(membership -> membership.getClubId().equals(clubId) && membership.isAdmin());
    }
    
    public List<ClubMembership> getAdminClubs() {
        if (clubMemberships == null) {
            return List.of();
        }
        return clubMemberships.stream()
                .filter(ClubMembership::isAdmin)
                .toList();
    }
}
