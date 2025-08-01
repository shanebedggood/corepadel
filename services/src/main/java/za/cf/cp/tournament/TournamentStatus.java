package za.cf.cp.tournament;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.util.UUID;

/**
 * TournamentStatus entity representing tournament statuses stored in PostgreSQL.
 * Maps to the 'tournament_status' table in the database.
 */
@Entity
@Table(name = "tournament_status", schema = "core")
public class TournamentStatus extends PanacheEntityBase {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "status_id")
    @JsonProperty("status_id")
    public UUID statusId;
    
    @Column(name = "name", nullable = false, unique = true)
    public String name;
    
    @Column(name = "description", columnDefinition = "TEXT")
    public String description;
    
    @Column(name = "color")
    public String color;
    
    @Column(name = "text_color")
    @JsonProperty("text_color")
    public String textColor;
    
    // Default constructor required by JPA
    public TournamentStatus() {}
    
    // Constructor with fields
    public TournamentStatus(String name, String description, String color, String textColor) {
        this.name = name;
        this.description = description;
        this.color = color;
        this.textColor = textColor;
    }
    
    // Getters and setters
    public UUID getStatusId() {
        return statusId;
    }
    
    public void setStatusId(UUID statusId) {
        this.statusId = statusId;
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
    
    public String getColor() {
        return color;
    }
    
    public void setColor(String color) {
        this.color = color;
    }
    
    public String getTextColor() {
        return textColor;
    }
    
    public void setTextColor(String textColor) {
        this.textColor = textColor;
    }
    
    @Override
    public String toString() {
        return "TournamentStatus{" +
                "statusId=" + statusId +
                ", name='" + name + '\'' +
                ", description='" + description + '\'' +
                ", color='" + color + '\'' +
                ", textColor='" + textColor + '\'' +
                '}';
    }
} 