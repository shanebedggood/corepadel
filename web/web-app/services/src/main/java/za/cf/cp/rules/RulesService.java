package za.cf.cp.rules;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class RulesService {

    /**
     * Get all padel rules sorted by order_number
     * @return List of all rules with their sections
     */
    @Transactional(readOnly = true)
    public List<PadelRule> getAllRules() {
        return PadelRule.listAllOrdered("orderNumber");
    }

    /**
     * Get a single rule by ID
     * @param ruleId The rule ID
     * @return The rule with its sections, or null if not found
     */
    @Transactional(readOnly = true)
    public PadelRule getRuleById(UUID ruleId) {
        return PadelRule.findById(ruleId);
    }

    /**
     * Create a new rule
     * @param rule The rule to create
     * @return The created rule
     */
    @Transactional
    public PadelRule createRule(PadelRule rule) {
        if (rule.getOrderNumber() == null) {
            // Auto-assign order number if not provided
            Long maxOrder = PadelRule.find("SELECT MAX(orderNumber) FROM PadelRule").firstResult();
            rule.setOrderNumber(maxOrder != null ? maxOrder.intValue() + 1 : 1);
        }
        
        rule.persist();
        return rule;
    }

    /**
     * Update an existing rule
     * @param rule The updated rule data
     * @return The updated rule
     */
    @Transactional
    public PadelRule updateRule(PadelRule rule) {
        PadelRule existingRule = PadelRule.findById(rule.getRuleId());
        if (existingRule == null) {
            throw new RuntimeException("Rule not found with ID: " + rule.getRuleId());
        }

        // Update basic fields
        existingRule.setTitle(rule.getTitle());
        existingRule.setOrderNumber(rule.getOrderNumber());
        existingRule.setUpdatedAt(java.time.LocalDateTime.now());

        // Update sections if provided
        if (rule.getSections() != null) {
            // Remove existing sections
            existingRule.getSections().clear();
            
            // Add new sections
            for (RuleSection section : rule.getSections()) {
                section.setRule(existingRule);
                existingRule.getSections().add(section);
            }
        }

        return existingRule;
    }

    /**
     * Delete a rule
     * @param ruleId The rule ID
     * @return true if deleted, false if not found
     */
    @Transactional
    public boolean deleteRule(UUID ruleId) {
        PadelRule rule = PadelRule.findById(ruleId);
        if (rule != null) {
            rule.delete();
            return true;
        }
        return false;
    }

    /**
     * Get rules by order number range
     * @param startOrder Start order number (inclusive)
     * @param endOrder End order number (inclusive)
     * @return List of rules in the specified range
     */
    @Transactional(readOnly = true)
    public List<PadelRule> getRulesByOrderRange(int startOrder, int endOrder) {
        return PadelRule.find("orderNumber BETWEEN ?1 AND ?2 ORDER BY orderNumber", startOrder, endOrder).list();
    }

    /**
     * Search rules by title
     * @param titleSearch Partial title to search for
     * @return List of matching rules
     */
    @Transactional(readOnly = true)
    public List<PadelRule> searchRulesByTitle(String titleSearch) {
        return PadelRule.find("title ILIKE ?1 ORDER BY orderNumber", "%" + titleSearch + "%").list();
    }
}
