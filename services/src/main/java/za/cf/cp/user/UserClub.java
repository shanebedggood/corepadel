package za.cf.cp.user;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import za.cf.cp.club.Club;
import java.util.UUID;

/**
 * UserClub entity representing user club memberships stored in PostgreSQL.
 * Maps to the 'user_club' table in the database.
 * Uses firebase_uid as the foreign key reference.
 */
@Entity
@Table(name = "user_club", schema = "core")
public class UserClub extends PanacheEntityBase {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "membership_id")
    @JsonProperty("membership_id")
    public UUID membershipId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "firebase_uid", nullable = false)
    public User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "club_id", nullable = false)
    public Club club;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id", nullable = false)
    @JsonProperty("role")
    public Role role;
    
    // Default constructor required by JPA
    public UserClub() {}
    
    // Constructor with fields
    public UserClub(User user, Club club, Role role) {
        this.user = user;
        this.club = club;
        this.role = role;
    }
    
    // Constructor with role name (for backward compatibility)
    public UserClub(User user, Club club, String roleName) {
        this.user = user;
        this.club = club;
        // Find the role by name
        this.role = Role.find("roleName", roleName).firstResult();
    }
    
    // Getters and setters
    public UUID getMembershipId() {
        return membershipId;
    }
    
    public void setMembershipId(UUID membershipId) {
        this.membershipId = membershipId;
    }
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
    
    public Club getClub() {
        return club;
    }
    
    public void setClub(Club club) {
        this.club = club;
    }
    
    public Role getRole() {
        return role;
    }
    
    public void setRole(Role role) {
        this.role = role;
    }
    
    // Convenience method to get role name
    public String getRoleName() {
        return role != null ? role.roleName : null;
    }
    
    @Override
    public String toString() {
        return "UserClub{" +
                "membershipId=" + membershipId +
                ", user=" + (user != null ? user.getFirebaseUid() : "null") +
                ", club=" + (club != null ? club.getClubId() : "null") +
                ", role='" + role + '\'' +
                '}';
    }
} 