package za.cf.cp.tournament;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.util.UUID;

/**
 * EliminationBracketSize entity representing elimination bracket sizes stored in PostgreSQL.
 * Maps to the 'elimination_bracket_size' table in the database.
 */
@Entity
@Table(name = "elimination_bracket_size", schema = "core")
public class EliminationBracketSize extends PanacheEntityBase {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "bracket_size_id")
    @JsonProperty("bracket_size_id")
    public UUID bracketSizeId;
    
    @Column(name = "name", nullable = false, unique = true)
    public String name;
    
    @Column(name = "description", columnDefinition = "TEXT")
    public String description;
    
    @Column(name = "teams", nullable = false)
    public Integer teams;
    
    // Default constructor required by JPA
    public EliminationBracketSize() {}
    
    // Constructor with fields
    public EliminationBracketSize(String name, String description, Integer teams) {
        this.name = name;
        this.description = description;
        this.teams = teams;
    }
    
    // Getters and setters
    public UUID getBracketSizeId() {
        return bracketSizeId;
    }
    
    public void setBracketSizeId(UUID bracketSizeId) {
        this.bracketSizeId = bracketSizeId;
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
    
    public Integer getTeams() {
        return teams;
    }
    
    public void setTeams(Integer teams) {
        this.teams = teams;
    }
    
    @Override
    public String toString() {
        return "EliminationBracketSize{" +
                "bracketSizeId=" + bracketSizeId +
                ", name='" + name + '\'' +
                ", description='" + description + '\'' +
                ", teams=" + teams +
                '}';
    }
} 