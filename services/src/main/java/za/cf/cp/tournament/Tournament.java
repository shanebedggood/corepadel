package za.cf.cp.tournament;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import za.cf.cp.club.Club;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Abstract Tournament entity representing the base class for all tournament types.
 * Contains common fields shared by all tournament formats.
 * Maps to the 'tournament' table in the database.
 */
@Entity
@Table(name = "tournament", schema = "core")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "tournament_type", discriminatorType = DiscriminatorType.STRING)
public abstract class Tournament extends PanacheEntityBase {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "tournament_id")
    @JsonProperty("tournament_id")
    public UUID tournamentId;
    
    @Column(name = "name", nullable = false)
    public String name;
    
    @Column(name = "description", columnDefinition = "TEXT")
    public String description;
    
    @Column(name = "start_date", nullable = false)
    @JsonProperty("start_date")
    public LocalDateTime startDate;
    
    @Column(name = "end_date", nullable = false)
    @JsonProperty("end_date")
    public LocalDateTime endDate;
    
    @Column(name = "registration_start_date")
    @JsonProperty("registration_start_date")
    public LocalDateTime registrationStartDate;
    
    @Column(name = "registration_end_date")
    @JsonProperty("registration_end_date")
    public LocalDateTime registrationEndDate;
    
    @Column(name = "max_participants", nullable = false)
    @JsonProperty("max_participants")
    public Integer maxParticipants;
    
    @Column(name = "current_participants")
    @JsonProperty("current_participants")
    public Integer currentParticipants = 0;
    
    @Column(name = "entry_fee")
    @JsonProperty("entry_fee")
    public BigDecimal entryFee = BigDecimal.ZERO;
    
    @Column(name = "firebase_uid", nullable = false)
    @JsonProperty("firebase_uid")
    public String firebaseUid;
    
    // Club relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "club_id", nullable = false)
    @JsonProperty("club")
    public Club club;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venue_club_id")
    @JsonProperty("venue_club")
    public Club venueClub;
    
    // Foreign key relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "format_id")
    public Format format;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    public Category category;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "registration_type_id")
    @JsonProperty("registration_type")
    public RegistrationType registrationType;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "status_id")
    public TournamentStatus status;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venue_type_id")
    @JsonProperty("venue_type")
    public VenueType venueType;
    
    @Column(name = "access_type")
    @JsonProperty("access_type")
    public String accessType = "open"; // 'open' (anyone can compete) or 'closed' (club only)
    
    
    // Default constructor required by JPA
    public Tournament() {}
    
    // Constructor with essential fields
    public Tournament(String name, String description, LocalDateTime startDate, LocalDateTime endDate, 
                     Integer maxParticipants, Club club, String firebaseUid) {
        this.name = name;
        this.description = description;
        this.startDate = startDate;
        this.endDate = endDate;
        this.maxParticipants = maxParticipants;
        this.club = club;
        this.firebaseUid = firebaseUid;
    }
    
    // Abstract method that subclasses must implement
    public abstract String getTournamentType();
    
    // Getters and setters
    public UUID getTournamentId() {
        return tournamentId;
    }
    
    public void setTournamentId(UUID tournamentId) {
        this.tournamentId = tournamentId;
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
    
    public Club getClub() {
        return club;
    }
    
    public void setClub(Club club) {
        this.club = club;
    }
    
    public Club getVenueClub() {
        return venueClub;
    }
    
    public void setVenueClub(Club venueClub) {
        this.venueClub = venueClub;
    }
    
    // Helper method for backward compatibility
    public String getClubId() {
        return club != null ? club.getClubId().toString() : null;
    }
    
    public String getFirebaseUid() {
        return firebaseUid;
    }
    
    public void setFirebaseUid(String firebaseUid) {
        this.firebaseUid = firebaseUid;
    }
    
    public Format getFormat() {
        return format;
    }
    
    public void setFormat(Format format) {
        this.format = format;
    }
    
    public Category getCategory() {
        return category;
    }
    
    public void setCategory(Category category) {
        this.category = category;
    }
    
    public RegistrationType getRegistrationType() {
        return registrationType;
    }
    
    public void setRegistrationType(RegistrationType registrationType) {
        this.registrationType = registrationType;
    }
    
    public TournamentStatus getStatus() {
        return status;
    }
    
    public void setStatus(TournamentStatus status) {
        this.status = status;
    }
    
    public VenueType getVenueType() {
        return venueType;
    }
    
    public void setVenueType(VenueType venueType) {
        this.venueType = venueType;
    }
    
    public String getAccessType() {
        return accessType;
    }
    
    public void setAccessType(String accessType) {
        this.accessType = accessType;
    }
    
    // Helper method for backward compatibility
    public String getVenueId() {
        return venueClub != null ? venueClub.getClubId().toString() : null;
    }
    
    @Override
    public String toString() {
        return "Tournament{" +
                "tournamentId=" + tournamentId +
                ", name='" + name + '\'' +
                ", description='" + description + '\'' +
                ", startDate=" + startDate +
                ", endDate=" + endDate +
                ", maxParticipants=" + maxParticipants +
                ", currentParticipants=" + currentParticipants +
                ", club=" + (club != null ? club.getName() : "null") +
                ", venueClub=" + (venueClub != null ? venueClub.getName() : "null") +
                ", firebaseUid='" + firebaseUid + '\'' +
                ", tournamentType='" + getTournamentType() + '\'' +
                '}';
    }
} 