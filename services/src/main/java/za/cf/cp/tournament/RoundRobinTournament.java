package za.cf.cp.tournament;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * RoundRobinTournament entity representing Round Robin tournaments.
 * Extends the abstract Tournament class and adds Round Robin specific fields.
 * Maps to the 'tournament' table in the database with tournament_type = 'ROUND_ROBIN'.
 */
@Entity
@DiscriminatorValue("ROUND_ROBIN")
public class RoundRobinTournament extends Tournament {
    
    @Column(name = "no_of_groups")
    @JsonProperty("no_of_groups")
    public Integer noOfGroups;
    
    // Round-robin specific relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "progression_type_id")
    @JsonProperty("progression_type")
    public ProgressionType progressionType;
    

    
    @Column(name = "teams_to_advance")
    @JsonProperty("teams_to_advance")
    public Integer teamsToAdvance;
    

    
    // Default constructor required by JPA
    public RoundRobinTournament() {
        super();
    }
    
    // Constructor with essential fields
    public RoundRobinTournament(String name, String description, LocalDateTime startDate, LocalDateTime endDate, 
                               Integer maxParticipants, String clubId, String firebaseUid, Integer noOfGroups) {
        super(name, description, startDate, endDate, maxParticipants, clubId, firebaseUid);
        this.noOfGroups = noOfGroups;
    }
    
    @Override
    public String getTournamentType() {
        return "ROUND_ROBIN";
    }
    
    // Getters and setters for Round Robin specific fields
    public Integer getNoOfGroups() {
        return noOfGroups;
    }
    
    public void setNoOfGroups(Integer noOfGroups) {
        this.noOfGroups = noOfGroups;
    }
    
    public ProgressionType getProgressionType() {
        return progressionType;
    }
    
    public void setProgressionType(ProgressionType progressionType) {
        this.progressionType = progressionType;
    }
    
    public Integer getTeamsToAdvance() {
        return teamsToAdvance;
    }
    
    public void setTeamsToAdvance(Integer teamsToAdvance) {
        this.teamsToAdvance = teamsToAdvance;
    }
    
    @Override
    public String toString() {
        return "RoundRobinTournament{" +
                "tournamentId=" + getTournamentId() +
                ", name='" + getName() + '\'' +
                ", description='" + getDescription() + '\'' +
                ", startDate=" + getStartDate() +
                ", endDate=" + getEndDate() +
                ", maxParticipants=" + getMaxParticipants() +
                ", currentParticipants=" + getCurrentParticipants() +
                ", clubId='" + getClubId() + '\'' +
                ", firebaseUid='" + getFirebaseUid() + '\'' +
                ", noOfGroups=" + noOfGroups +
                ", tournamentType='" + getTournamentType() + '\'' +
                '}';
    }
}
