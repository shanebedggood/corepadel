package za.cf.cp.tournament;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.util.List;
import java.util.UUID;

/**
 * Format entity representing tournament formats stored in PostgreSQL.
 * Maps to the 'format' table in the database.
 */
@Entity
@Table(name = "format", schema = "core")
public class Format extends PanacheEntityBase {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "format_id")
    @JsonProperty("format_id")
    public UUID formatId;
    
    @Column(name = "name", nullable = false, unique = true)
    public String name;
    
    @Column(name = "description", columnDefinition = "TEXT")
    public String description;
    
    @Column(name = "category")
    public String category;
    
    @Column(name = "max_participants")
    @JsonProperty("max_participants")
    public Integer maxParticipants;
    
    @Column(name = "min_participants")
    @JsonProperty("min_participants")
    public Integer minParticipants;
    
    @Column(name = "rules", columnDefinition = "JSONB")
    @Convert(converter = JsonArrayConverter.class)
    public List<String> rules;
    
    // Default constructor required by JPA
    public Format() {}
    
    // Constructor with fields
    public Format(String name, String description, String category, Integer maxParticipants, Integer minParticipants, List<String> rules) {
        this.name = name;
        this.description = description;
        this.category = category;
        this.maxParticipants = maxParticipants;
        this.minParticipants = minParticipants;
        this.rules = rules;
    }
    
    // Getters and setters
    public UUID getFormatId() {
        return formatId;
    }
    
    public void setFormatId(UUID formatId) {
        this.formatId = formatId;
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
    
    public String getCategory() {
        return category;
    }
    
    public void setCategory(String category) {
        this.category = category;
    }
    
    public Integer getMaxParticipants() {
        return maxParticipants;
    }
    
    public void setMaxParticipants(Integer maxParticipants) {
        this.maxParticipants = maxParticipants;
    }
    
    public Integer getMinParticipants() {
        return minParticipants;
    }
    
    public void setMinParticipants(Integer minParticipants) {
        this.minParticipants = minParticipants;
    }
    
    public List<String> getRules() {
        return rules;
    }
    
    public void setRules(List<String> rules) {
        this.rules = rules;
    }
    
    @Override
    public String toString() {
        return "Format{" +
                "formatId=" + formatId +
                ", name='" + name + '\'' +
                ", description='" + description + '\'' +
                ", category='" + category + '\'' +
                ", maxParticipants=" + maxParticipants +
                ", minParticipants=" + minParticipants +
                ", rules=" + rules +
                '}';
    }
} 