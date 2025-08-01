package za.cf.cp.tournament.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * DTO representing a tournament status.
 * Matches the Firebase structure for backward compatibility.
 */
public class TournamentStatusDto {
    
    @JsonProperty("id")
    public String id;
    
    @JsonProperty("name")
    public String name;
    
    @JsonProperty("description")
    public String description;
    
    @JsonProperty("color")
    public String color;
    
    @JsonProperty("textColor")
    public String textColor;
    
    @JsonProperty("isActive")
    public boolean isActive;
    
    @JsonProperty("order")
    public Integer order;
    
    // Default constructor
    public TournamentStatusDto() {}
    
    // Constructor with fields
    public TournamentStatusDto(String id, String name, String description, String color, String textColor, boolean isActive, Integer order) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.color = color;
        this.textColor = textColor;
        this.isActive = isActive;
        this.order = order;
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
    
    public String getColor() {
        return color;
    }
    
    public void setColor(String color) {
        this.color = color;
    }
    
    public String getTextColor() {
        return textColor;
    }
    
    public void setTextColor(String textColor) {
        this.textColor = textColor;
    }
    
    public boolean isActive() {
        return isActive;
    }
    
    public void setActive(boolean active) {
        isActive = active;
    }
    
    public Integer getOrder() {
        return order;
    }
    
    public void setOrder(Integer order) {
        this.order = order;
    }
} 