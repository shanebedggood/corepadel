package za.cf.cp.rules;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "rule_section")
public class RuleSection extends PanacheEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "section_id")
    @JsonProperty("sectionId")
    public UUID sectionId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rule_id", nullable = false)
    @JsonProperty("ruleId")
    public PadelRule rule;
    
    @Column(name = "section_order", nullable = false)
    @JsonProperty("sectionOrder")
    public Integer sectionOrder;
    
    @Column(name = "section_title", length = 100)
    @JsonProperty("sectionTitle")
    public String sectionTitle;
    
    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    @JsonProperty("content")
    public String content;
    
    @Column(name = "created_at")
    @JsonProperty("createdAt")
    public LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    @JsonProperty("updatedAt")
    public LocalDateTime updatedAt;
    
    // Constructors
    public RuleSection() {}
    
    public RuleSection(UUID ruleId, Integer sectionOrder, String sectionTitle, String content) {
        this.sectionOrder = sectionOrder;
        this.sectionTitle = sectionTitle;
        this.content = content;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public UUID getSectionId() {
        return sectionId;
    }
    
    public void setSectionId(UUID sectionId) {
        this.sectionId = sectionId;
    }
    
    public PadelRule getRule() {
        return rule;
    }
    
    public void setRule(PadelRule rule) {
        this.rule = rule;
    }
    
    public Integer getSectionOrder() {
        return sectionOrder;
    }
    
    public void setSectionOrder(Integer sectionOrder) {
        this.sectionOrder = sectionOrder;
    }
    
    public String getSectionTitle() {
        return sectionTitle;
    }
    
    public void setSectionTitle(String sectionTitle) {
        this.sectionTitle = sectionTitle;
    }
    
    public String getContent() {
        return content;
    }
    
    public void setContent(String content) {
        this.content = content;
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
        return "RuleSection{" +
                "sectionId=" + sectionId +
                ", ruleId=" + (rule != null ? rule.ruleId : "null") +
                ", sectionOrder=" + sectionOrder +
                ", sectionTitle='" + sectionTitle + '\'' +
                ", content='" + content + '\'' +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}
