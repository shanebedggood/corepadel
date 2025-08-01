package za.cf.cp.user;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnore;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.util.UUID;

/**
 * UserRole entity representing user roles stored in PostgreSQL.
 * Maps to the 'user_role' table in the database.
 */
@Entity
@Table(name = "user_role", schema = "core")
public class UserRole extends PanacheEntityBase {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "role_id")
    @JsonProperty("role_id")
    public UUID roleId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    public User user;
    
    @Column(name = "role_name", nullable = false)
    @JsonProperty("role_name")
    public String roleName;
    
    // Default constructor required by JPA
    public UserRole() {}
    
    // Constructor with fields
    public UserRole(User user, String roleName) {
        this.user = user;
        this.roleName = roleName;
    }
    
    // Getters and setters
    public UUID getRoleId() {
        return roleId;
    }
    
    public void setRoleId(UUID roleId) {
        this.roleId = roleId;
    }
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
    
    public String getRoleName() {
        return roleName;
    }
    
    public void setRoleName(String roleName) {
        this.roleName = roleName;
    }
    
    @Override
    public String toString() {
        return "UserRole{" +
                "roleId=" + roleId +
                ", user=" + (user != null ? user.getUserId() : "null") +
                ", roleName='" + roleName + '\'' +
                '}';
    }
} 