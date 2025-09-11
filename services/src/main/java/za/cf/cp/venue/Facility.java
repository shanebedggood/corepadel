package za.cf.cp.venue;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Facility entity representing individual facilities that can be associated with venues.
 * Maps to the 'facility' table in the database.
 */
@Entity
@Table(name = "facility", schema = "core")
public class Facility extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "facility_id")
    @JsonProperty("id")
    public UUID facilityId;

    @Column(name = "name", nullable = false, unique = true)
    @JsonProperty("name")
    public String name;

    @Column(name = "description")
    @JsonProperty("description")
    public String description;

    @Column(name = "icon")
    @JsonProperty("icon")
    public String icon;

    @Column(name = "category", nullable = false)
    @JsonProperty("category")
    public String category;

    @Column(name = "is_countable", nullable = false)
    @JsonProperty("is_countable")
    public Boolean isCountable;

    @Column(name = "unit")
    @JsonProperty("unit")
    public String unit;

    @Column(name = "created_at")
    @JsonProperty("created_at")
    public LocalDateTime createdAt;

    @Column(name = "updated_at")
    @JsonProperty("updated_at")
    public LocalDateTime updatedAt;

    // Default constructor
    public Facility() {}

    // Constructor with required fields
    public Facility(String name, String category, Boolean isCountable) {
        this.name = name;
        this.category = category;
        this.isCountable = isCountable;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and setters
    public UUID getFacilityId() {
        return facilityId;
    }

    public void setFacilityId(UUID facilityId) {
        this.facilityId = facilityId;
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

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Boolean getIsCountable() {
        return isCountable;
    }

    public void setIsCountable(Boolean isCountable) {
        this.isCountable = isCountable;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    @Override
    public String toString() {
        return "Facility{" +
                "facilityId=" + facilityId +
                ", name='" + name + '\'' +
                ", description='" + description + '\'' +
                ", icon='" + icon + '\'' +
                ", category='" + category + '\'' +
                ", isCountable=" + isCountable +
                ", unit='" + unit + '\'' +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}
