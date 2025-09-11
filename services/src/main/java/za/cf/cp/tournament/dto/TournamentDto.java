package za.cf.cp.tournament.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Abstract DTO representing tournament data.
 * Contains common fields shared by all tournament formats.
 * Matches the Firebase structure for backward compatibility.
 */
@JsonTypeInfo(
    use = JsonTypeInfo.Id.NAME,
    include = JsonTypeInfo.As.PROPERTY,
    property = "tournamentType"
)
@JsonSubTypes({
    @JsonSubTypes.Type(value = RoundRobinTournamentDto.class, name = "ROUND_ROBIN"),
    @JsonSubTypes.Type(value = AmericanoTournamentDto.class, name = "AMERICANO")
})
public abstract class TournamentDto {
    
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
    
    @JsonProperty("clubId")
    public String clubId;
    
    @JsonProperty("firebaseUid")
    public String firebaseUid;
    
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
    
    @JsonProperty("accessType")
    public String accessType;
    
    @JsonProperty("venueId")
    public String venueId;
    
    @JsonProperty("venue")
    public Object venue;
    
    @JsonProperty("club")
    public ClubDto club;
    
    // Abstract method that subclasses must implement
    public abstract String getTournamentType();
    
    // Default constructor
    public TournamentDto() {}
    
    // Constructor with essential fields
    public TournamentDto(String id, String name, String description, LocalDateTime startDate, 
                        LocalDateTime endDate, Integer maxParticipants, 
                        String clubId, String firebaseUid) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.startDate = startDate;
        this.endDate = endDate;
        this.maxParticipants = maxParticipants;
        this.currentParticipants = 0;
        this.entryFee = BigDecimal.ZERO;
        this.clubId = clubId;
        this.firebaseUid = firebaseUid;
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
    
    public String getClubId() {
        return clubId;
    }
    
    public void setClubId(String clubId) {
        this.clubId = clubId;
    }
    
    public String getFirebaseUid() {
        return firebaseUid;
    }
    
    public void setFirebaseUid(String firebaseUid) {
        this.firebaseUid = firebaseUid;
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
    
    public String getAccessType() {
        return accessType;
    }
    
    public void setAccessType(String accessType) {
        this.accessType = accessType;
    }
    
    public String getVenueId() {
        return venueId;
    }
    
    public void setVenueId(String venueId) {
        this.venueId = venueId;
    }
    
    public Object getVenue() {
        return venue;
    }
    
    public void setVenue(Object venue) {
        this.venue = venue;
    }
    
    public ClubDto getClub() {
        return club;
    }
    
    public void setClub(ClubDto club) {
        this.club = club;
    }
} 