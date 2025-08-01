package za.cf.cp.tournament.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

/**
 * DTO representing a tournament format.
 * Matches the Firebase structure for backward compatibility.
 */
public class TournamentFormatDto {
    
    @JsonProperty("id")
    public String id;
    
    @JsonProperty("name")
    public String name;
    
    @JsonProperty("description")
    public String description;
    
    @JsonProperty("isActive")
    public boolean isActive;
    
    @JsonProperty("maxParticipants")
    public Integer maxParticipants;
    
    @JsonProperty("minParticipants")
    public Integer minParticipants;
    
    @JsonProperty("rules")
    public List<String> rules;
    
    @JsonProperty("category")
    public String category;
    
    // Default constructor
    public TournamentFormatDto() {}
    
    // Constructor with fields
    public TournamentFormatDto(String id, String name, String description, boolean isActive,
                              Integer maxParticipants, Integer minParticipants, List<String> rules, String category) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.isActive = isActive;
        this.maxParticipants = maxParticipants;
        this.minParticipants = minParticipants;
        this.rules = rules;
        this.category = category;
    }
    
    // Getters and setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
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
    
    public boolean isActive() {
        return isActive;
    }
    
    public void setActive(boolean active) {
        isActive = active;
    }
    
    public Integer getMaxParticipants() {
        return maxParticipants;
    }
    
    public void setMaxParticipants(Integer maxParticipants) {
        this.maxParticipants = maxParticipants;
    }
    
    public Integer getMinParticipants() {
        return minParticipants;
    }
    
    public void setMinParticipants(Integer minParticipants) {
        this.minParticipants = minParticipants;
    }
    
    public List<String> getRules() {
        return rules;
    }
    
    public void setRules(List<String> rules) {
        this.rules = rules;
    }
    
    public String getCategory() {
        return category;
    }
    
    public void setCategory(String category) {
        this.category = category;
    }
} 