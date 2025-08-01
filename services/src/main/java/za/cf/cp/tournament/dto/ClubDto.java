package za.cf.cp.tournament.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * DTO representing club data for tournaments.
 */
public class ClubDto {
    
    @JsonProperty("id")
    public String id;
    
    @JsonProperty("name")
    public String name;
    
    @JsonProperty("website")
    public String website;
    
    // Default constructor
    public ClubDto() {}
    
    // Constructor with fields
    public ClubDto(String id, String name, String website) {
        this.id = id;
        this.name = name;
        this.website = website;
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
    
    public String getWebsite() {
        return website;
    }
    
    public void setWebsite(String website) {
        this.website = website;
    }
} 