package za.cf.cp.user;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.util.UUID;

/**
 * Role entity representing available roles in the system.
 * Maps to the 'role' table in the database.
 */
@Entity
@Table(name = "role", schema = "core")
public class Role extends PanacheEntityBase {
    
    @Id
    @Column(name = "role_id")
    @JsonProperty("role_id")
    public UUID roleId;
    
    @Column(name = "role_name", nullable = false, unique = true)
    @JsonProperty("role_name")
    public String roleName;
    
    // Default constructor required by JPA
    public Role() {}
    
    // Constructor with fields
    public Role(String roleName) {
        this.roleName = roleName;
    }
    
    // Getters and setters
    public UUID getRoleId() {
        return roleId;
    }
    
    public void setRoleId(UUID roleId) {
        this.roleId = roleId;
    }
    
    public String getRoleName() {
        return roleName;
    }
    
    public void setRoleName(String roleName) {
        this.roleName = roleName;
    }
    
    @Override
    public String toString() {
        return "Role{" +
                "roleId=" + roleId +
                ", roleName='" + roleName + '\'' +
                '}';
    }
}
