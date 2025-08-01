package za.cf.cp;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.util.List;
import java.util.UUID;

/**
 * Rule entity representing padel rules stored in PostgreSQL.
 * Maps to the 'rule' table in the database.
 */
@Entity
@Table(name = "rule", schema = "core")
public class Rule extends PanacheEntityBase {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "rule_id")
    @JsonProperty("rule_id")
    public UUID ruleId;
    
    @Column(name = "title", nullable = false, unique = true)
    public String title;
    
    @Column(name = "order_number")
    @JsonProperty("order_number")
    public Integer orderNumber;
    
    @Column(name = "rule_description", columnDefinition = "TEXT[]")
    @Convert(converter = StringArrayConverter.class)
    @JsonProperty("rule_description")
    public List<String> ruleDescription;
    
    // Default constructor required by JPA
    public Rule() {}
    
    // Constructor with fields
    public Rule(String title, Integer orderNumber, List<String> ruleDescription) {
        this.title = title;
        this.orderNumber = orderNumber;
        this.ruleDescription = ruleDescription;
    }
    
    // Getters and setters
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
    
    public List<String> getRuleDescription() {
        return ruleDescription;
    }
    
    public void setRuleDescription(List<String> ruleDescription) {
        this.ruleDescription = ruleDescription;
    }
    
    @Override
    public String toString() {
        return "Rule{" +
                "ruleId=" + ruleId +
                ", title='" + title + '\'' +
                ", orderNumber=" + orderNumber +
                ", ruleDescription=" + ruleDescription +
                '}';
    }
} 