package za.cf.cp.tournament.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;

/**
 * DTO representing Round Robin tournament data.
 * Extends the abstract TournamentDto and adds Round Robin specific fields.
 * Matches the Firebase structure for backward compatibility.
 */
public class RoundRobinTournamentDto extends TournamentDto {
    
    @JsonProperty("noOfGroups")
    public Integer noOfGroups;
    
    // Round-robin specific fields
    @JsonProperty("progressionOption")
    public TournamentProgressionOptionDto progressionOption;
    
    @JsonProperty("teamsToAdvancePerGroup")
    public Integer teamsToAdvance;
    
    // Default constructor
    public RoundRobinTournamentDto() {
        super();
    }
    
    // Constructor with essential fields
    public RoundRobinTournamentDto(String id, String name, String description, LocalDateTime startDate, 
                                  LocalDateTime endDate, Integer maxParticipants, 
                                  String clubId, String userId, Integer noOfGroups) {
        super(id, name, description, startDate, endDate, maxParticipants, clubId, userId);
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
    
    public TournamentProgressionOptionDto getProgressionOption() {
        return progressionOption;
    }
    
    public void setProgressionOption(TournamentProgressionOptionDto progressionOption) {
        this.progressionOption = progressionOption;
    }
    
    public Integer getTeamsToAdvance() {
        return teamsToAdvance;
    }
    
    public void setTeamsToAdvance(Integer teamsToAdvance) {
        this.teamsToAdvance = teamsToAdvance;
    }
}
