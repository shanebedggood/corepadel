package za.cf.cp.tournament;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.util.UUID;

/**
 * TeamsToAdvance entity representing teams to advance settings stored in PostgreSQL.
 * Maps to the 'teams_to_advance' table in the database.
 */
@Entity
@Table(name = "teams_to_advance", schema = "core")
public class TeamsToAdvance extends PanacheEntityBase {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "teams_advance_id")
    @JsonProperty("teams_advance_id")
    public UUID teamsAdvanceId;
    
    @Column(name = "name", nullable = false, unique = true)
    public String name;
    
    @Column(name = "description", columnDefinition = "TEXT")
    public String description;
    
    @Column(name = "team_count", nullable = false)
    @JsonProperty("team_count")
    public Integer teamCount;
    
    // Default constructor required by JPA
    public TeamsToAdvance() {}
    
    // Constructor with fields
    public TeamsToAdvance(String name, String description, Integer teamCount) {
        this.name = name;
        this.description = description;
        this.teamCount = teamCount;
    }
    
    // Getters and setters
    public UUID getTeamsAdvanceId() {
        return teamsAdvanceId;
    }
    
    public void setTeamsAdvanceId(UUID teamsAdvanceId) {
        this.teamsAdvanceId = teamsAdvanceId;
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
    
    public Integer getTeamCount() {
        return teamCount;
    }
    
    public void setTeamCount(Integer teamCount) {
        this.teamCount = teamCount;
    }
    
    @Override
    public String toString() {
        return "TeamsToAdvance{" +
                "teamsAdvanceId=" + teamsAdvanceId +
                ", name='" + name + '\'' +
                ", description='" + description + '\'' +
                ", teamCount=" + teamCount +
                '}';
    }
} 