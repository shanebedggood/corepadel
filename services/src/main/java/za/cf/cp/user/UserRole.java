package za.cf.cp.user;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnore;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.util.UUID;

/**
 * UserRole entity representing user roles stored in PostgreSQL.
 * Maps to the 'user_role' table in the database.
 * Uses firebase_uid as the foreign key reference to User.
 * References the Role entity for role information.
 */
@Entity
@Table(name = "user_role", schema = "core")
public class UserRole extends PanacheEntityBase {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "user_role_id")
    @JsonProperty("user_role_id")
    public UUID userRoleId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "firebase_uid", nullable = false)
    @JsonIgnore
    public User user;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id", nullable = false)
    @JsonProperty("role")
    public Role role;
    
    // Default constructor required by JPA
    public UserRole() {}
    
    // Constructor with fields
    public UserRole(User user, Role role) {
        this.user = user;
        this.role = role;
    }
    
    // Constructor with role name (for backward compatibility)
    public UserRole(User user, String roleName) {
        this.user = user;
        // Find the role by name
        this.role = Role.find("roleName", roleName).firstResult();
    }
    
    // Getters and setters
    public UUID getUserRoleId() {
        return userRoleId;
    }
    
    public void setUserRoleId(UUID userRoleId) {
        this.userRoleId = userRoleId;
    }
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
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
        return "UserRole{" +
                "userRoleId=" + userRoleId +
                ", user=" + (user != null ? user.getFirebaseUid() : "null") +
                ", role=" + (role != null ? role.roleName : "null") +
                '}';
    }
} 