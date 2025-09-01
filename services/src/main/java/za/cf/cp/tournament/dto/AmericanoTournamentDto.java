package za.cf.cp.tournament.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;

/**
 * DTO representing Americano tournament data.
 * Extends the abstract TournamentDto and adds Americano specific fields.
 * Matches the Firebase structure for backward compatibility.
 */
public class AmericanoTournamentDto extends TournamentDto {
    
    @JsonProperty("maxPlayersPerTeam")
    public Integer maxPlayersPerTeam = 4; // Default for Americano
    
    @JsonProperty("rotationInterval")
    public Integer rotationInterval = 15; // Minutes between rotations
    
    @JsonProperty("pointsToWin")
    public Integer pointsToWin = 11; // Points needed to win a game
    
    @JsonProperty("gamesPerRotation")
    public Integer gamesPerRotation = 1; // Games played before rotation
    
    // Default constructor
    public AmericanoTournamentDto() {
        super();
    }
    
    // Constructor with essential fields
    public AmericanoTournamentDto(String id, String name, String description, LocalDateTime startDate, 
                                 LocalDateTime endDate, Integer maxParticipants, 
                                 String clubId, String userId) {
        super(id, name, description, startDate, endDate, maxParticipants, clubId, userId);
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
}
