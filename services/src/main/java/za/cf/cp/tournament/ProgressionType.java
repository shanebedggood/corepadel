package za.cf.cp.tournament;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.util.UUID;

/**
 * ProgressionType entity representing tournament progression types stored in PostgreSQL.
 * Maps to the 'progression_type' table in the database.
 */
@Entity
@Table(name = "progression_type", schema = "core")
public class ProgressionType extends PanacheEntityBase {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "progression_type_id")
    @JsonProperty("progression_type_id")
    public UUID progressionTypeId;
    
    @Column(name = "name", nullable = false, unique = true)
    public String name;
    
    @Column(name = "description", columnDefinition = "TEXT")
    public String description;
    
    // Default constructor required by JPA
    public ProgressionType() {}
    
    // Constructor with fields
    public ProgressionType(String name, String description) {
        this.name = name;
        this.description = description;
    }
    
    // Getters and setters
    public UUID getProgressionTypeId() {
        return progressionTypeId;
    }
    
    public void setProgressionTypeId(UUID progressionTypeId) {
        this.progressionTypeId = progressionTypeId;
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
        return "ProgressionType{" +
                "progressionTypeId=" + progressionTypeId +
                ", name='" + name + '\'' +
                ", description='" + description + '\'' +
                '}';
    }
} 