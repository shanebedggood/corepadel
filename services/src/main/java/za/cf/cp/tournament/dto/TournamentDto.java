package za.cf.cp.tournament.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO representing tournament data.
 * Matches the Firebase structure for backward compatibility.
 */
public class TournamentDto {
    
    @JsonProperty("id")
    public String id;
    
    @JsonProperty("name")
    public String name;
    
    @JsonProperty("description")
    public String description;
    
    @JsonProperty("startDate")
    public LocalDateTime startDate;
    
    @JsonProperty("endDate")
    public LocalDateTime endDate;
    
    @JsonProperty("registrationStartDate")
    public LocalDateTime registrationStartDate;
    
    @JsonProperty("registrationEndDate")
    public LocalDateTime registrationEndDate;
    
    @JsonProperty("maxParticipants")
    public Integer maxParticipants;
    
    @JsonProperty("currentParticipants")
    public Integer currentParticipants;
    
    @JsonProperty("entryFee")
    public BigDecimal entryFee;
    
    @JsonProperty("noOfGroups")
    public Integer noOfGroups;
    
    @JsonProperty("clubId")
    public String clubId;
    
    @JsonProperty("userId")
    public String userId;

    
    // Foreign key relationships as nested objects
    @JsonProperty("format")
    public TournamentFormatDto format;
    
    @JsonProperty("category")
    public TournamentCategoryDto category;
    
    @JsonProperty("registrationType")
    public TournamentRegistrationTypeDto registrationType;
    
    @JsonProperty("status")
    public TournamentStatusDto status;
    
    @JsonProperty("venueType")
    public TournamentVenueTypeDto venueType;
    
    @JsonProperty("venueId")
    public String venueId;
    
    // Round-robin specific fields
    @JsonProperty("progressionOption")
    public TournamentProgressionOptionDto progressionOption;
    
    @JsonProperty("advancementModel")
    public AdvancementModelDto advancementModel;
    
    @JsonProperty("eliminationBracketSize")
    public EliminationBracketSizeDto eliminationBracketSize;
    
    @JsonProperty("club")
    public ClubDto club;
    
    // Default constructor
    public TournamentDto() {}
    
    // Constructor with essential fields
    public TournamentDto(String id, String name, String description, LocalDateTime startDate, 
                        LocalDateTime endDate, Integer maxParticipants, 
                        String clubId, String userId) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.startDate = startDate;
        this.endDate = endDate;
        this.maxParticipants = maxParticipants;
        this.currentParticipants = 0;
        this.entryFee = BigDecimal.ZERO;
        this.clubId = clubId;
        this.userId = userId;

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
    
    public LocalDateTime getStartDate() {
        return startDate;
    }
    
    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }
    
    public LocalDateTime getEndDate() {
        return endDate;
    }
    
    public void setEndDate(LocalDateTime endDate) {
        this.endDate = endDate;
    }
    
    public LocalDateTime getRegistrationStartDate() {
        return registrationStartDate;
    }
    
    public void setRegistrationStartDate(LocalDateTime registrationStartDate) {
        this.registrationStartDate = registrationStartDate;
    }
    
    public LocalDateTime getRegistrationEndDate() {
        return registrationEndDate;
    }
    
    public void setRegistrationEndDate(LocalDateTime registrationEndDate) {
        this.registrationEndDate = registrationEndDate;
    }
    
    public Integer getMaxParticipants() {
        return maxParticipants;
    }
    
    public void setMaxParticipants(Integer maxParticipants) {
        this.maxParticipants = maxParticipants;
    }
    
    public Integer getCurrentParticipants() {
        return currentParticipants;
    }
    
    public void setCurrentParticipants(Integer currentParticipants) {
        this.currentParticipants = currentParticipants;
    }
    
    public BigDecimal getEntryFee() {
        return entryFee;
    }
    
    public void setEntryFee(BigDecimal entryFee) {
        this.entryFee = entryFee;
    }
    
    public Integer getNoOfGroups() {
        return noOfGroups;
    }
    
    public void setNoOfGroups(Integer noOfGroups) {
        this.noOfGroups = noOfGroups;
    }
    
    public String getClubId() {
        return clubId;
    }
    
    public void setClubId(String clubId) {
        this.clubId = clubId;
    }
    
    public String getUserId() {
        return userId;
    }
    
    public void setUserId(String userId) {
        System.out.println("Setting userId in DTO: " + userId);
        this.userId = userId;
    }
    

    
    public TournamentFormatDto getFormat() {
        return format;
    }
    
    public void setFormat(TournamentFormatDto format) {
        this.format = format;
    }
    
    public TournamentCategoryDto getCategory() {
        return category;
    }
    
    public void setCategory(TournamentCategoryDto category) {
        this.category = category;
    }
    
    public TournamentRegistrationTypeDto getRegistrationType() {
        return registrationType;
    }
    
    public void setRegistrationType(TournamentRegistrationTypeDto registrationType) {
        this.registrationType = registrationType;
    }
    
    public TournamentStatusDto getStatus() {
        return status;
    }
    
    public void setStatus(TournamentStatusDto status) {
        this.status = status;
    }
    
    public TournamentVenueTypeDto getVenueType() {
        return venueType;
    }
    
    public void setVenueType(TournamentVenueTypeDto venueType) {
        this.venueType = venueType;
    }
    
    public String getVenueId() {
        return venueId;
    }
    
    public void setVenueId(String venueId) {
        this.venueId = venueId;
    }
    
    public TournamentProgressionOptionDto getProgressionOption() {
        return progressionOption;
    }
    
    public void setProgressionOption(TournamentProgressionOptionDto progressionOption) {
        this.progressionOption = progressionOption;
    }
    
    public AdvancementModelDto getAdvancementModel() {
        return advancementModel;
    }
    
    public void setAdvancementModel(AdvancementModelDto advancementModel) {
        this.advancementModel = advancementModel;
    }
    
    public EliminationBracketSizeDto getEliminationBracketSize() {
        return eliminationBracketSize;
    }
    
    public void setEliminationBracketSize(EliminationBracketSizeDto eliminationBracketSize) {
        this.eliminationBracketSize = eliminationBracketSize;
    }
    
    public ClubDto getClub() {
        return club;
    }
    
    public void setClub(ClubDto club) {
        this.club = club;
    }
} 