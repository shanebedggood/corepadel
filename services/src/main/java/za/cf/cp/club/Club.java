package za.cf.cp.club;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import za.cf.cp.venue.Address;
import java.util.List;
import java.util.UUID;

/**
 * Unified Club entity representing clubs, venues, and other organizations stored in PostgreSQL.
 * Maps to the 'club' table in the database.
 * This entity now handles both traditional clubs and venues through the type field.
 */
@Entity
@Table(name = "club", schema = "core")
public class Club extends PanacheEntityBase {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "club_id")
    @JsonProperty("id")
    public UUID clubId;
    
    @Column(name = "name", nullable = false, unique = true)
    public String name;
    
    @Column(name = "website")
    public String website;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    public ClubType type = ClubType.CLUB; // Default to CLUB
    
    // Venue-specific fields (nullable for traditional clubs)
    @OneToMany(mappedBy = "club", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JsonProperty("facilities")
    public List<ClubFacility> facilities;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "address_id")
    @JsonProperty("address")
    public Address address;
    
    // Default constructor required by JPA
    public Club() {}
    
    // Constructor with basic fields
    public Club(String name, String website) {
        this.name = name;
        this.website = website;
        this.type = ClubType.CLUB;
    }
    
    // Constructor with type
    public Club(String name, String website, ClubType type) {
        this.name = name;
        this.website = website;
        this.type = type;
    }
    
    // Constructor for venues with address
    public Club(String name, String website, ClubType type, Address address) {
        this.name = name;
        this.website = website;
        this.type = type;
        this.address = address;
    }
    
    // Getters and setters
    public UUID getClubId() {
        return clubId;
    }
    
    public void setClubId(UUID clubId) {
        this.clubId = clubId;
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
    
    public ClubType getType() {
        return type;
    }
    
    public void setType(ClubType type) {
        this.type = type;
    }
    
    public List<ClubFacility> getFacilities() {
        return facilities;
    }
    
    public void setFacilities(List<ClubFacility> facilities) {
        this.facilities = facilities;
    }
    
    public Address getAddress() {
        return address;
    }
    
    public void setAddress(Address address) {
        this.address = address;
    }
    
    // Helper methods
    public boolean isVenue() {
        return ClubType.VENUE.equals(this.type);
    }
    
    public boolean isClub() {
        return ClubType.CLUB.equals(this.type);
    }
    
    public boolean isAcademy() {
        return ClubType.ACADEMY.equals(this.type);
    }
    
    public boolean isLeague() {
        return ClubType.LEAGUE.equals(this.type);
    }
    
    @Override
    public String toString() {
        return "Club{" +
                "clubId=" + clubId +
                ", name='" + name + '\'' +
                ", website='" + website + '\'' +
                ", type=" + type +
                ", facilities=" + facilities +
                ", address=" + address +
                '}';
    }
} 