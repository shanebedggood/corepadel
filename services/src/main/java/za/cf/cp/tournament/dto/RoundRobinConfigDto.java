package za.cf.cp.tournament.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

/**
 * DTO representing the round-robin configuration response.
 * Matches the Firebase structure for backward compatibility.
 */
public class RoundRobinConfigDto {
    
    @JsonProperty("progressionTypes")
    public List<TournamentProgressionOptionDto> progressionTypes;
    
    @JsonProperty("groupAdvancementSettings")
    public GroupAdvancementSettingsDto groupAdvancementSettings;
    
    @JsonProperty("combinedAdvancementSettings")
    public CombinedAdvancementSettingsDto combinedAdvancementSettings;
    
    @JsonProperty("lastUpdated")
    public String lastUpdated;
    
    // Default constructor
    public RoundRobinConfigDto() {}
    
    // Constructor with fields
    public RoundRobinConfigDto(List<TournamentProgressionOptionDto> progressionTypes,
                              GroupAdvancementSettingsDto groupAdvancementSettings,
                              CombinedAdvancementSettingsDto combinedAdvancementSettings,
                              String lastUpdated) {
        this.progressionTypes = progressionTypes;
        this.groupAdvancementSettings = groupAdvancementSettings;
        this.combinedAdvancementSettings = combinedAdvancementSettings;
        this.lastUpdated = lastUpdated;
    }
    
    // Getters and setters
    public List<TournamentProgressionOptionDto> getProgressionTypes() {
        return progressionTypes;
    }
    
    public void setProgressionTypes(List<TournamentProgressionOptionDto> progressionTypes) {
        this.progressionTypes = progressionTypes;
    }
    
    public GroupAdvancementSettingsDto getGroupAdvancementSettings() {
        return groupAdvancementSettings;
    }
    
    public void setGroupAdvancementSettings(GroupAdvancementSettingsDto groupAdvancementSettings) {
        this.groupAdvancementSettings = groupAdvancementSettings;
    }
    
    public CombinedAdvancementSettingsDto getCombinedAdvancementSettings() {
        return combinedAdvancementSettings;
    }
    
    public void setCombinedAdvancementSettings(CombinedAdvancementSettingsDto combinedAdvancementSettings) {
        this.combinedAdvancementSettings = combinedAdvancementSettings;
    }
    
    public String getLastUpdated() {
        return lastUpdated;
    }
    
    public void setLastUpdated(String lastUpdated) {
        this.lastUpdated = lastUpdated;
    }
    
    // Inner classes for nested structures
    public static class GroupAdvancementSettingsDto {
        @JsonProperty("eliminationBracketSize")
        public List<Object> eliminationBracketSize;
        
        public GroupAdvancementSettingsDto() {}
        
        public GroupAdvancementSettingsDto(List<Object> eliminationBracketSize) {
            this.eliminationBracketSize = eliminationBracketSize;
        }
    }
    
    public static class CombinedAdvancementSettingsDto {
        @JsonProperty("numOfTeamsToAdvanceOverall")
        public List<Integer> numOfTeamsToAdvanceOverall;
        
        public CombinedAdvancementSettingsDto() {}
        
        public CombinedAdvancementSettingsDto(List<Integer> numOfTeamsToAdvanceOverall) {
            this.numOfTeamsToAdvanceOverall = numOfTeamsToAdvanceOverall;
        }
    }
} 