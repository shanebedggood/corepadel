package za.cf.cp.tournament.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * DTO representing teams to advance settings.
 * Matches the Firebase structure for backward compatibility.
 */
public class TeamsToAdvanceDto {
    
    @JsonProperty("id")
    public String id;
    
    @JsonProperty("name")
    public String name;
    
    @JsonProperty("description")
    public String description;
    
    @JsonProperty("isActive")
    public boolean isActive;
    
    // Default constructor
    public TeamsToAdvanceDto() {}
    
    // Constructor with fields
    public TeamsToAdvanceDto(String id, String name, String description, boolean isActive) {
        this.id = id;
        this.name = name;
        this.description = description;
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
    
    public boolean isActive() {
        return isActive;
    }
    
    public void setActive(boolean active) {
        isActive = active;
    }
} 