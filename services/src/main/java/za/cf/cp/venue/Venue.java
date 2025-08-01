package za.cf.cp.venue;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import za.cf.cp.venue.Address;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Venue entity representing venues stored in PostgreSQL.
 * Maps to the 'venue' table in the database.
 */
@Entity
@Table(name = "venue", schema = "core")
public class Venue extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "venue_id")
    @JsonProperty("venue_id")
    public UUID venueId;

    @Column(name = "name", nullable = false, unique = true)
    @JsonProperty("name")
    public String name;

    @Column(name = "website")
    @JsonProperty("website")
    public String website;

    @Column(name = "facilities")
    @JsonProperty("facilities")
    public String facilities;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "address_id", nullable = false)
    @JsonProperty("address")
    public Address address;



    // Default constructor
    public Venue() {}

    // Constructor with required fields
    public Venue(String name, Address address) {
        this.name = name;
        this.address = address;
    }

    // Getters and setters
    public UUID getVenueId() {
        return venueId;
    }

    public void setVenueId(UUID venueId) {
        this.venueId = venueId;
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

    public String getFacilities() {
        return facilities;
    }

    public void setFacilities(String facilities) {
        this.facilities = facilities;
    }

    public Address getAddress() {
        return address;
    }

    public void setAddress(Address address) {
        this.address = address;
    }



    @Override
    public String toString() {
        return "Venue{" +
                "venueId=" + venueId +
                ", name='" + name + '\'' +
                ", website='" + website + '\'' +
                ", facilities='" + facilities + '\'' +
                ", address=" + address +
                '}';
    }
} 