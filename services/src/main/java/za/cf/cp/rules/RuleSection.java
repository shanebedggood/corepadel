package za.cf.cp.rules;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnore;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "rule_section", schema = "core")
public class RuleSection extends PanacheEntityBase {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "section_id")
    public UUID sectionId;
    
    @Column(name = "section_order", nullable = false)
    @JsonProperty("sectionOrder")
    public Integer sectionOrder;
    
    @Column(name = "section_title", length = 100)
    @JsonProperty("sectionTitle")
    public String sectionTitle;
    
    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    @JsonProperty("content")
    public String content;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rule_id", nullable = false)
    @JsonIgnore
    public PadelRule rule;
    
    // Constructors
    public RuleSection() {}
    
    public RuleSection(Integer sectionOrder, String sectionTitle, String content) {
        this.sectionOrder = sectionOrder;
        this.sectionTitle = sectionTitle;
        this.content = content;
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
    
    @JsonProperty("ruleId")
    public String getRuleId() {
        return rule != null ? rule.ruleId.toString() : null;
    }
    
    @Override
    public String toString() {
        return "RuleSection{" +
                "sectionId=" + sectionId +
                ", ruleId=" + (rule != null ? rule.ruleId : "null") +
                ", sectionOrder=" + sectionOrder +
                ", sectionTitle='" + sectionTitle + '\'' +
                ", content='" + content + '\'' +
                '}';
    }
}
