package za.cf.cp.club;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.util.UUID;

/**
 * Club entity representing clubs stored in PostgreSQL.
 * Maps to the 'club' table in the database.
 */
@Entity
@Table(name = "club", schema = "core")
public class Club extends PanacheEntityBase {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "club_id")
    @JsonProperty("club_id")
    public UUID clubId;
    
    @Column(name = "name", nullable = false, unique = true)
    public String name;
    
    @Column(name = "website")
    public String website;
    
    // Default constructor required by JPA
    public Club() {}
    
    // Constructor with fields
    public Club(String name, String website) {
        this.name = name;
        this.website = website;
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
    
    @Override
    public String toString() {
        return "Club{" +
                "clubId=" + clubId +
                ", name='" + name + '\'' +
                ", website='" + website + '\'' +
                '}';
    }
} 