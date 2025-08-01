package za.cf.cp.tournament.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * DTO representing an elimination bracket size.
 * Matches the Firebase structure for backward compatibility.
 */
public class EliminationBracketSizeDto {
    
    @JsonProperty("id")
    public String id;
    
    @JsonProperty("name")
    public String name;
    
    @JsonProperty("description")
    public String description;
    
    @JsonProperty("teams")
    public Integer teams;
    
    @JsonProperty("isActive")
    public boolean isActive;
    
    // Default constructor
    public EliminationBracketSizeDto() {}
    
    // Constructor with fields
    public EliminationBracketSizeDto(String id, String name, String description, Integer teams, boolean isActive) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.teams = teams;
        this.isActive = isActive;
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
    
    public Integer getTeams() {
        return teams;
    }
    
    public void setTeams(Integer teams) {
        this.teams = teams;
    }
    
    public boolean isActive() {
        return isActive;
    }
    
    public void setActive(boolean active) {
        isActive = active;
    }
} 