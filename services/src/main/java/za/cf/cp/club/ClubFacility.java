package za.cf.cp.club;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import za.cf.cp.venue.Facility;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Junction entity representing the many-to-many relationship between clubs and facilities.
 * Maps to the 'club_facility' table in the database.
 * Replaces VenueFacility to work with the unified Club entity.
 */
@Entity
@Table(name = "club_facility", schema = "core")
public class ClubFacility extends PanacheEntityBase {

    @EmbeddedId
    public ClubFacilityId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("clubId")
    @JoinColumn(name = "club_id")
    @JsonIgnore
    public Club club;

    @ManyToOne(fetch = FetchType.EAGER)
    @MapsId("facilityId")
    @JoinColumn(name = "facility_id")
    @JsonProperty("facility")
    public Facility facility;

    @Column(name = "quantity")
    @JsonProperty("quantity")
    public Integer quantity;

    @Column(name = "notes")
    @JsonProperty("notes")
    public String notes;

    @Column(name = "created_at")
    @JsonProperty("created_at")
    public LocalDateTime createdAt;

    // Default constructor
    public ClubFacility() {}

    // Constructor with required fields
    public ClubFacility(Club club, Facility facility, Integer quantity) {
        this.id = new ClubFacilityId(club.clubId, facility.facilityId);
        this.club = club;
        this.facility = facility;
        this.quantity = quantity;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and setters
    public ClubFacilityId getId() {
        return id;
    }

    public void setId(ClubFacilityId id) {
        this.id = id;
    }

    public Club getClub() {
        return club;
    }

    public void setClub(Club club) {
        this.club = club;
    }

    public Facility getFacility() {
        return facility;
    }

    public void setFacility(Facility facility) {
        this.facility = facility;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public String toString() {
        return "ClubFacility{" +
                "id=" + id +
                ", facility=" + facility +
                ", quantity=" + quantity +
                ", notes='" + notes + '\'' +
                ", createdAt=" + createdAt +
                '}';
    }

    /**
     * Composite primary key for ClubFacility.
     */
    @Embeddable
    public static class ClubFacilityId implements java.io.Serializable {
        
        @Column(name = "club_id")
        public UUID clubId;
        
        @Column(name = "facility_id")
        public UUID facilityId;

        // Default constructor
        public ClubFacilityId() {}

        // Constructor with required fields
        public ClubFacilityId(UUID clubId, UUID facilityId) {
            this.clubId = clubId;
            this.facilityId = facilityId;
        }

        // Getters and setters
        public UUID getClubId() {
            return clubId;
        }

        public void setClubId(UUID clubId) {
            this.clubId = clubId;
        }

        public UUID getFacilityId() {
            return facilityId;
        }

        public void setFacilityId(UUID facilityId) {
            this.facilityId = facilityId;
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            ClubFacilityId that = (ClubFacilityId) o;
            return clubId.equals(that.clubId) && facilityId.equals(that.facilityId);
        }

        @Override
        public int hashCode() {
            return java.util.Objects.hash(clubId, facilityId);
        }
    }
}
