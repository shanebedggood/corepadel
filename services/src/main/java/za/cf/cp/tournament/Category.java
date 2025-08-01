package za.cf.cp.tournament;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.util.UUID;

/**
 * Category entity representing tournament categories stored in PostgreSQL.
 * Maps to the 'category' table in the database.
 */
@Entity
@Table(name = "category", schema = "core")
public class Category extends PanacheEntityBase {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "category_id")
    @JsonProperty("category_id")
    public UUID categoryId;
    
    @Column(name = "name", nullable = false, unique = true)
    public String name;
    
    @Column(name = "description", columnDefinition = "TEXT")
    public String description;
    
    // Default constructor required by JPA
    public Category() {}
    
    // Constructor with fields
    public Category(String name, String description) {
        this.name = name;
        this.description = description;
    }
    
    // Getters and setters
    public UUID getCategoryId() {
        return categoryId;
    }
    
    public void setCategoryId(UUID categoryId) {
        this.categoryId = categoryId;
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
    
    @Override
    public String toString() {
        return "Category{" +
                "categoryId=" + categoryId +
                ", name='" + name + '\'' +
                ", description='" + description + '\'' +
                '}';
    }
} 