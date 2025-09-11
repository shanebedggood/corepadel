package za.cf.cp.rules;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnore;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "rule", schema = "core")
public class PadelRule extends PanacheEntityBase {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "rule_id")
    @JsonProperty("ruleId")
    public UUID ruleId;
    
    @Column(name = "title", nullable = false)
    public String title;
    
    @Column(name = "order_number")
    @JsonProperty("orderNumber")
    public Integer orderNumber;
    
    @OneToMany(mappedBy = "rule", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @OrderBy("sectionOrder ASC")
    @JsonIgnore
    public List<RuleSection> sections;
    
    public PadelRule() {}
    
    public PadelRule(String title, Integer orderNumber) {
        this.title = title;
        this.orderNumber = orderNumber;
    }
    
    public static List<PadelRule> listAllOrdered(String orderBy) {
        return list("ORDER BY " + orderBy);
    }
    
    public String getRuleId() {
        return ruleId.toString();
    }
    
    public void setRuleId(String ruleId) {
        this.ruleId = UUID.fromString(ruleId);
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
    
    public List<RuleSection> getSections() {
        return sections;
    }
    
    public void setSections(List<RuleSection> sections) {
        this.sections = sections;
    }
    
    @JsonProperty("sections")
    public List<RuleSection> getSectionsForJson() {
        if (sections != null) {
            return sections.stream()
                .map(section -> {
                    RuleSection jsonSection = new RuleSection();
                    jsonSection.sectionId = section.sectionId;
                    jsonSection.sectionOrder = section.sectionOrder; // Always keep the order
                    
                    // If section has a meaningful title, include it; otherwise set to null
                    if (hasSectionTitle(section)) {
                        jsonSection.sectionTitle = section.sectionTitle;
                    } else {
                        jsonSection.sectionTitle = null;
                    }
                    
                    jsonSection.content = section.content;
                    return jsonSection;
                })
                .collect(java.util.stream.Collectors.toList());
        }
        return null;
    }
    
    /**
     * Helper method to check if a section should be displayed with a title
     * @param section The rule section to check
     * @return true if the section has a meaningful title, false otherwise
     */
    public static boolean hasSectionTitle(RuleSection section) {
        return section.sectionTitle != null && 
               !section.sectionTitle.trim().isEmpty() && 
               !section.sectionTitle.trim().equals("Section");
    }
    
    /**
     * Helper method to check if a section should display a number
     * @param section The rule section to check
     * @return true if the section should display a number, false otherwise
     */
    public static boolean shouldDisplayNumber(RuleSection section) {
        return hasSectionTitle(section);
    }
    
    /**
     * Returns sections formatted for display, where sections without meaningful titles
     * have their title set to null so the frontend can handle them differently
     * @return List of sections with display-friendly formatting
     */
    @JsonProperty("displaySections")
    public List<RuleSection> getDisplaySections() {
        if (sections != null) {
            return sections.stream()
                .map(section -> {
                    RuleSection displaySection = new RuleSection();
                    displaySection.sectionId = section.sectionId;
                    displaySection.sectionOrder = section.sectionOrder; // Always keep the order
                    
                    // If section has a meaningful title, include it; otherwise set to null
                    if (hasSectionTitle(section)) {
                        displaySection.sectionTitle = section.sectionTitle;
                    } else {
                        displaySection.sectionTitle = null;
                    }
                    
                    displaySection.content = section.content;
                    return displaySection;
                })
                .collect(java.util.stream.Collectors.toList());
        }
        return null;
    }
    
    @Override
    public String toString() {
        return "PadelRule{" +
                "ruleId=" + ruleId +
                ", title='" + title + '\'' +
                ", orderNumber=" + orderNumber +
                ", sectionsCount=" + (sections != null ? sections.size() : 0) +
                '}';
    }
}
