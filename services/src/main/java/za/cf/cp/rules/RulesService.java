package za.cf.cp.rules;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import java.util.List;

@ApplicationScoped
public class RulesService {
    
    @Transactional
    public List<PadelRule> getAllRules() {
        return PadelRule.listAllOrdered("orderNumber");
    }
    
    @Transactional
    public PadelRule getRuleById(String ruleId) {
        try {
            // Convert UUID string to Long for PanacheEntity compatibility
            Long numericId = Long.valueOf(ruleId);
            return PadelRule.findById(numericId);
        } catch (NumberFormatException e) {
            // If it's a UUID, we need to handle it differently
            // For now, return null as the ID types don't match
            return null;
        }
    }
    
    @Transactional
    public PadelRule createRule(PadelRule rule) {
        if (rule.getOrderNumber() == null) {
            Object maxOrderResult = PadelRule.find("SELECT MAX(orderNumber) FROM PadelRule").firstResult();
            Long maxOrder = maxOrderResult != null ? (Long) maxOrderResult : null;
            rule.setOrderNumber(maxOrder != null ? maxOrder.intValue() + 1 : 1);
        }
        rule.persist();
        return rule;
    }
    
    @Transactional
    public PadelRule updateRule(PadelRule rule) {
        PadelRule existingRule = PadelRule.findById(rule.getRuleId());
        if (existingRule == null) {
            throw new RuntimeException("Rule not found with ID: " + rule.getRuleId());
        }

        existingRule.setTitle(rule.getTitle());
        existingRule.setOrderNumber(rule.getOrderNumber());

        if (rule.getSections() != null) {
            existingRule.getSections().clear();
            for (RuleSection section : rule.getSections()) {
                section.setRule(existingRule);
                existingRule.getSections().add(section);
            }
        }

        return existingRule;
    }
    
    @Transactional
    public boolean deleteRule(String ruleId) {
        try {
            Long numericId = Long.valueOf(ruleId);
            PadelRule rule = PadelRule.findById(numericId);
            if (rule != null) {
                rule.delete();
                return true;
            }
        } catch (NumberFormatException e) {
            // Handle UUID conversion error
        }
        return false;
    }
    
    @Transactional
    public List<PadelRule> getRulesByOrderRange(int startOrder, int endOrder) {
        return PadelRule.find("orderNumber BETWEEN ?1 AND ?2 ORDER BY orderNumber", startOrder, endOrder).list();
    }
    
    @Transactional
    public List<PadelRule> searchRulesByTitle(String titleSearch) {
        return PadelRule.find("title ILIKE ?1 ORDER BY orderNumber", "%" + titleSearch + "%").list();
    }
}
