package za.cf.cp.tournament;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * AmericanoTournament entity representing Americano format tournaments.
 * Extends the abstract Tournament class and adds Americano specific fields.
 * Maps to the 'tournament' table in the database with tournament_type = 'AMERICANO'.
 */
@Entity
@DiscriminatorValue("AMERICANO")
public class AmericanoTournament extends Tournament {
    
    @Column(name = "max_players_per_team")
    @JsonProperty("max_players_per_team")
    public Integer maxPlayersPerTeam = 4; // Default for Americano
    
    @Column(name = "rotation_interval")
    @JsonProperty("rotation_interval")
    public Integer rotationInterval = 15; // Minutes between rotations
    
    @Column(name = "points_to_win")
    @JsonProperty("points_to_win")
    public Integer pointsToWin = 11; // Points needed to win a game
    
    @Column(name = "games_per_rotation")
    @JsonProperty("games_per_rotation")
    public Integer gamesPerRotation = 1; // Games played before rotation
    
    // Default constructor required by JPA
    public AmericanoTournament() {
        super();
    }
    
    // Constructor with essential fields
    public AmericanoTournament(String name, String description, LocalDateTime startDate, LocalDateTime endDate, 
                              Integer maxParticipants, String clubId, String firebaseUid) {
        super(name, description, startDate, endDate, maxParticipants, clubId, firebaseUid);
    }
    
    @Override
    public String getTournamentType() {
        return "AMERICANO";
    }
    
    // Getters and setters for Americano specific fields
    public Integer getMaxPlayersPerTeam() {
        return maxPlayersPerTeam;
    }
    
    public void setMaxPlayersPerTeam(Integer maxPlayersPerTeam) {
        this.maxPlayersPerTeam = maxPlayersPerTeam;
    }
    
    public Integer getRotationInterval() {
        return rotationInterval;
    }
    
    public void setRotationInterval(Integer rotationInterval) {
        this.rotationInterval = rotationInterval;
    }
    
    public Integer getPointsToWin() {
        return pointsToWin;
    }
    
    public void setPointsToWin(Integer pointsToWin) {
        this.pointsToWin = pointsToWin;
    }
    
    public Integer getGamesPerRotation() {
        return gamesPerRotation;
    }
    
    public void setGamesPerRotation(Integer gamesPerRotation) {
        this.gamesPerRotation = gamesPerRotation;
    }
    
    @Override
    public String toString() {
        return "AmericanoTournament{" +
                "tournamentId=" + getTournamentId() +
                ", name='" + getName() + '\'' +
                ", description='" + getDescription() + '\'' +
                ", startDate=" + getStartDate() +
                ", endDate=" + getEndDate() +
                ", maxParticipants=" + getMaxParticipants() +
                ", currentParticipants=" + getCurrentParticipants() +
                ", clubId='" + getClubId() + '\'' +
                ", firebaseUid='" + getFirebaseUid() + '\'' +
                ", maxPlayersPerTeam=" + maxPlayersPerTeam +
                ", rotationInterval=" + rotationInterval +
                ", pointsToWin=" + pointsToWin +
                ", gamesPerRotation=" + gamesPerRotation +
                ", tournamentType='" + getTournamentType() + '\'' +
                '}';
    }
}
