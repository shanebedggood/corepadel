package za.cf.cp.tournament;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.util.UUID;

/**
 * AdvancementModel entity representing tournament advancement models stored in PostgreSQL.
 * Maps to the 'advancement_model' table in the database.
 */
@Entity
@Table(name = "advancement_model", schema = "core")
public class AdvancementModel extends PanacheEntityBase {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "advancement_model_id")
    @JsonProperty("advancement_model_id")
    public UUID advancementModelId;
    
    @Column(name = "name", nullable = false, unique = true)
    public String name;
    
    @Column(name = "description", columnDefinition = "TEXT")
    public String description;
    
    // Default constructor required by JPA
    public AdvancementModel() {}
    
    // Constructor with fields
    public AdvancementModel(String name, String description) {
        this.name = name;
        this.description = description;
    }
    
    // Getters and setters
    public UUID getAdvancementModelId() {
        return advancementModelId;
    }
    
    public void setAdvancementModelId(UUID advancementModelId) {
        this.advancementModelId = advancementModelId;
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
        return "AdvancementModel{" +
                "advancementModelId=" + advancementModelId +
                ", name='" + name + '\'' +
                ", description='" + description + '\'' +
                '}';
    }
} 