package za.cf.cp.rules;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "padel_rule")
public class PadelRule extends PanacheEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "rule_id")
    @JsonProperty("ruleId")
    public UUID ruleId;
    
    @Column(name = "title", nullable = false)
    @JsonProperty("title")
    public String title;
    
    @Column(name = "order_number")
    @JsonProperty("orderNumber")
    public Integer orderNumber;
    
    @Column(name = "created_at")
    @JsonProperty("createdAt")
    public LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    @JsonProperty("updatedAt")
    public LocalDateTime updatedAt;
    
    // New relationship to rule sections
    @OneToMany(mappedBy = "rule", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @OrderBy("sectionOrder ASC")
    @JsonProperty("sections")
    public List<RuleSection> sections;
    
    // Legacy field - will be removed after migration
    @Column(name = "rule_description", columnDefinition = "TEXT")
    @JsonProperty("ruleDescription")
    public String ruleDescription;
    
    // Constructors
    public PadelRule() {}
    
    public PadelRule(String title, Integer orderNumber) {
        this.title = title;
        this.orderNumber = orderNumber;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    // Static method for ordered listing
    public static List<PadelRule> listAllOrdered(String orderBy) {
        return list("ORDER BY " + orderBy);
    }
    
    // Getters and Setters
    public UUID getRuleId() {
        return ruleId;
    }
    
    public void setRuleId(UUID ruleId) {
        this.ruleId = ruleId;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public Integer getOrderNumber() {
        return orderNumber;
    }
    
    public void setOrderNumber(Integer orderNumber) {
        this.orderNumber = orderNumber;
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
    
    public List<RuleSection> getSections() {
        return sections;
    }
    
    public void setSections(List<RuleSection> sections) {
        this.sections = sections;
    }
    
    public String getRuleDescription() {
        return ruleDescription;
    }
    
    public void setRuleDescription(String ruleDescription) {
        this.ruleDescription = ruleDescription;
    }
    
    @Override
    public String toString() {
        return "PadelRule{" +
                "ruleId=" + ruleId +
                ", title='" + title + '\'' +
                ", orderNumber=" + orderNumber +
                ", sectionsCount=" + (sections != null ? sections.size() : 0) +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}
