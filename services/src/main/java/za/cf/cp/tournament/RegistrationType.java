package za.cf.cp.tournament;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.util.UUID;

/**
 * RegistrationType entity representing tournament registration types stored in PostgreSQL.
 * Maps to the 'registration_type' table in the database.
 */
@Entity
@Table(name = "registration_type", schema = "core")
public class RegistrationType extends PanacheEntityBase {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "registration_type_id")
    @JsonProperty("registration_type_id")
    public UUID registrationTypeId;
    
    @Column(name = "name", nullable = false, unique = true)
    public String name;
    
    @Column(name = "description", columnDefinition = "TEXT")
    public String description;
    
    // Default constructor required by JPA
    public RegistrationType() {}
    
    // Constructor with fields
    public RegistrationType(String name, String description) {
        this.name = name;
        this.description = description;
    }
    
    // Getters and setters
    public UUID getRegistrationTypeId() {
        return registrationTypeId;
    }
    
    public void setRegistrationTypeId(UUID registrationTypeId) {
        this.registrationTypeId = registrationTypeId;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    @Override
    public String toString() {
        return "RegistrationType{" +
                "registrationTypeId=" + registrationTypeId +
                ", name='" + name + '\'' +
                ", description='" + description + '\'' +
                '}';
    }
} 