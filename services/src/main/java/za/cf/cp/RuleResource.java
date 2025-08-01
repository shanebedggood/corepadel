package za.cf.cp;

import io.quarkus.hibernate.orm.rest.data.panache.PanacheEntityResource;
import java.util.UUID;

/**
 * REST resource interface for managing padel rules.
 * This interface provides the basic CRUD operations through PanacheEntityResource.
 * Custom methods are implemented in RuleResourceImpl.
 */
public interface RuleResource extends PanacheEntityResource<Rule, UUID> {
} 