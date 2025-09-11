# Rule Sections Migration Guide

## Overview
This migration restructures the padel rules from a JSON array format to a proper relational database structure using a `rule_section` table.

## Problem
The current `rule_description` field stores rules as JSON arrays like:
```json
{"The following are considered service faults:","a) The server infringes rule 3...","b) The server completely misses the ball..."}
```

This causes formatting issues and makes it difficult to:
- Display rules properly
- Search within specific rule sections
- Update individual rule points
- Maintain consistent formatting

## Solution
Create a new `rule_section` table with a proper relationship to `padel_rule`.

## Database Changes

### 1. New Table Structure
```sql
CREATE TABLE rule_section (
    section_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_id UUID NOT NULL REFERENCES padel_rule(rule_id) ON DELETE CASCADE,
    section_order INTEGER NOT NULL,
    section_title VARCHAR(100), -- e.g., "a)", "b)", "Introduction"
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Indexes
```sql
CREATE INDEX idx_rule_section_rule_id ON rule_section(rule_id);
CREATE INDEX idx_rule_section_order ON rule_section(rule_id, section_order);
```

## Migration Steps

### Step 1: Run the Migration
```bash
# Connect to your PostgreSQL database
psql -U your_username -d your_database

# Run the migration script
\i web/web-app/database/migrations/05-create-rule-sections-table.sql
```

### Step 2: Verify Migration
The migration script includes a verification query that shows:
- Rule titles
- Number of sections per rule
- Section titles for each rule

### Step 3: Test the New Structure
```sql
-- Check the migrated data
SELECT 
    r.title,
    rs.section_title,
    rs.content,
    rs.section_order
FROM padel_rule r
JOIN rule_section rs ON r.rule_id = rs.rule_id
ORDER BY r.order_number, rs.section_order;
```

## Backend Changes

### 1. New Entity: RuleSection.java
- Located at: `services/src/main/java/za/cf/cp/rules/RuleSection.java`
- Represents individual rule sections with proper relationships

### 2. Updated Entity: PadelRule.java
- Located at: `services/src/main/java/za/cf/cp/rules/PadelRule.java`
- Now has a `@OneToMany` relationship to `RuleSection`
- Maintains backward compatibility with `rule_description` field

### 3. Key Changes
- `sections: List<RuleSection>` - New relationship
- `rule_description: String` - Legacy field (can be removed after migration)

## Frontend Changes

### 1. Updated Interfaces
```typescript
export interface PadelRule {
    ruleId?: string;
    title: string;
    sections: RuleSection[];
    order_number?: number;
}

export interface RuleSection {
    sectionId?: string;
    ruleId: string;
    sectionOrder: number;
    sectionTitle?: string;
    content: string;
}
```

### 2. Updated Components
- `rules.component.html` - Now displays sections instead of rule_description
- `rules.ts` - Updated to work with sections structure
- `quarkus-rules.service.ts` - Updated interfaces and service methods

## Benefits of New Structure

1. **Better Formatting**: Each section can be displayed with proper styling
2. **Searchability**: Can search within specific rule sections
3. **Maintainability**: Easier to update individual sections
4. **Performance**: Better indexing and querying capabilities
5. **Flexibility**: Can add metadata to sections (e.g., difficulty, category)
6. **Consistency**: Structured data format across all rules

## Example Output

### Before (JSON Array)
```json
{"The following are considered service faults:","a) The server infringes rule 3...","b) The server completely misses the ball..."}
```

### After (Structured Sections)
```typescript
{
  title: "Service Faults",
  sections: [
    {
      sectionTitle: "Introduction",
      content: "The following are considered service faults:"
    },
    {
      sectionTitle: "a)",
      content: "The server infringes rule 3. (see THE SERVE above)."
    },
    {
      sectionTitle: "b)",
      content: "The server completely misses the ball when attempting to serve."
    }
  ]
}
```

## Rollback Plan

If you need to revert the changes:
```bash
# Run the rollback script
\i web/web-app/database/migrations/05-create-rule-sections-table-rollback.sql
```

## Next Steps

1. **Test the migration** with your existing data
2. **Update any admin interfaces** to work with the new structure
3. **Remove the old `rule_description` column** once you're confident the new structure works
4. **Consider adding more metadata** to sections (e.g., difficulty level, category)

## Testing

After migration, verify that:
- All rules are displayed correctly
- Section titles are properly extracted
- Content is formatted correctly
- Modal displays work with the new structure
- Search functionality works as expected
