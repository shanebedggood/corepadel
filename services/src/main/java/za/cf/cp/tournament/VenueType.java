package za.cf.cp.tournament;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.util.UUID;

/**
 * VenueType entity representing tournament venue types stored in PostgreSQL.
 * Maps to the 'venue_type' table in the database.
 */
@Entity
@Table(name = "venue_type", schema = "core")
public class VenueType extends PanacheEntityBase {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "venue_type_id")
    @JsonProperty("venue_type_id")
    public UUID venueTypeId;
    
    @Column(name = "name", nullable = false, unique = true)
    public String name;
    
    @Column(name = "description", columnDefinition = "TEXT")
    public String description;
    
    // Default constructor required by JPA
    public VenueType() {}
    
    // Constructor with fields
    public VenueType(String name, String description) {
        this.name = name;
        this.description = description;
    }
    
    // Getters and setters
    public UUID getVenueTypeId() {
        return venueTypeId;
    }
    
    public void setVenueTypeId(UUID venueTypeId) {
        this.venueTypeId = venueTypeId;
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
        return "VenueType{" +
                "venueTypeId=" + venueTypeId +
                ", name='" + name + '\'' +
                ", description='" + description + '\'' +
                '}';
    }
} 