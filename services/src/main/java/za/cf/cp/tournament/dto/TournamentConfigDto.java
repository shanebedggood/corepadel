package za.cf.cp.tournament.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

/**
 * DTO representing the complete tournament configuration response.
 * Matches the Firebase structure for backward compatibility.
 */
public class TournamentConfigDto {
    
    @JsonProperty("formats")
    public List<TournamentFormatDto> formats;
    
    @JsonProperty("statuses")
    public List<TournamentStatusDto> statuses;
    
    @JsonProperty("categories")
    public List<TournamentCategoryDto> categories;
    
    @JsonProperty("registrationTypes")
    public List<TournamentRegistrationTypeDto> registrationTypes;
    
    @JsonProperty("venueTypes")
    public List<TournamentVenueTypeDto> venueTypes;
    
    @JsonProperty("lastUpdated")
    public String lastUpdated;
    
    // Default constructor
    public TournamentConfigDto() {}
    
    // Constructor with fields
    public TournamentConfigDto(List<TournamentFormatDto> formats, 
                              List<TournamentStatusDto> statuses,
                              List<TournamentCategoryDto> categories,
                              List<TournamentRegistrationTypeDto> registrationTypes,
                              List<TournamentVenueTypeDto> venueTypes,
                              String lastUpdated) {
        this.formats = formats;
        this.statuses = statuses;
        this.categories = categories;
        this.registrationTypes = registrationTypes;
        this.venueTypes = venueTypes;
        this.lastUpdated = lastUpdated;
    }
    
    // Getters and setters
    public List<TournamentFormatDto> getFormats() {
        return formats;
    }
    
    public void setFormats(List<TournamentFormatDto> formats) {
        this.formats = formats;
    }
    
    public List<TournamentStatusDto> getStatuses() {
        return statuses;
    }
    
    public void setStatuses(List<TournamentStatusDto> statuses) {
        this.statuses = statuses;
    }
    
    public List<TournamentCategoryDto> getCategories() {
        return categories;
    }
    
    public void setCategories(List<TournamentCategoryDto> categories) {
        this.categories = categories;
    }
    
    public List<TournamentRegistrationTypeDto> getRegistrationTypes() {
        return registrationTypes;
    }
    
    public void setRegistrationTypes(List<TournamentRegistrationTypeDto> registrationTypes) {
        this.registrationTypes = registrationTypes;
    }
    
    public List<TournamentVenueTypeDto> getVenueTypes() {
        return venueTypes;
    }
    
    public void setVenueTypes(List<TournamentVenueTypeDto> venueTypes) {
        this.venueTypes = venueTypes;
    }
    
    public String getLastUpdated() {
        return lastUpdated;
    }
    
    public void setLastUpdated(String lastUpdated) {
        this.lastUpdated = lastUpdated;
    }
} 