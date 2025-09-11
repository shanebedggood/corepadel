package za.cf.cp.tournament;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.util.UUID;

/**
 * TournamentGroup entity representing tournament groups stored in PostgreSQL.
 * Maps to the 'tournament_group' table in the database.
 */
@Entity
@Table(name = "tournament_group", schema = "core")
public class TournamentGroup extends PanacheEntityBase {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "group_id")
    @JsonProperty("group_id")
    public UUID groupId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tournament_id", nullable = false)
    public Tournament tournament;
    
    @Column(name = "name", nullable = false)
    public String name;
    
    @Column(name = "max_teams", nullable = false)
    @JsonProperty("max_teams")
    public Integer maxTeams;
    
    @Column(name = "current_teams")
    @JsonProperty("current_teams")
    public Integer currentTeams = 0;
    
    @Column(name = "venue_id")
    @JsonProperty("venue_id")
    public String venueId;
    

    
    // Default constructor required by JPA
    public TournamentGroup() {}
    
    // Constructor with essential fields
    public TournamentGroup(Tournament tournament, String name, Integer maxTeams) {
        this.tournament = tournament;
        this.name = name;
        this.maxTeams = maxTeams;
    }
    
    // Getters and setters
    public UUID getGroupId() {
        return groupId;
    }
    
    public void setGroupId(UUID groupId) {
        this.groupId = groupId;
    }
    
    public Tournament getTournament() {
        return tournament;
    }
    
    public void setTournament(Tournament tournament) {
        this.tournament = tournament;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public Integer getMaxTeams() {
        return maxTeams;
    }
    
    public void setMaxTeams(Integer maxTeams) {
        this.maxTeams = maxTeams;
    }
    
    public Integer getCurrentTeams() {
        return currentTeams;
    }
    
    public void setCurrentTeams(Integer currentTeams) {
        this.currentTeams = currentTeams;
    }
    
    public String getVenueId() {
        return venueId;
    }
    
    public void setVenueId(String venueId) {
        this.venueId = venueId;
    }
    

    
    @Override
    public String toString() {
        return "TournamentGroup{" +
                "groupId=" + groupId +
                ", tournamentId=" + (tournament != null ? tournament.getTournamentId() : null) +
                ", name='" + name + '\'' +
                ", maxTeams=" + maxTeams +
                ", currentTeams=" + currentTeams +
                ", venueId='" + venueId + '\'' +
                '}';
    }
} 