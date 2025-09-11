-- Final consolidation: Merge padel_rule data into existing rule structure
-- This script consolidates all rules data and removes duplicates

-- Set search path to include core schema
SET search_path TO core, public;

-- Step 1: Insert unique rules from padel_rule into the existing rule table
INSERT INTO core.rule (rule_id, title, order_number)
SELECT 
    gen_random_uuid() as rule_id,
    title,
    order_number
FROM core.padel_rule
WHERE NOT EXISTS (
    SELECT 1 FROM core.rule WHERE core.rule.title = core.padel_rule.title
);

-- Step 2: Create a temporary mapping table to link padel_rule IDs to new rule IDs
CREATE TEMP TABLE rule_mapping AS
SELECT 
    pr.id as old_id,
    cr.rule_id as new_rule_id
FROM core.padel_rule pr
JOIN core.rule cr ON cr.title = pr.title;

-- Step 3: Insert rule sections from padel_rule into the existing rule_section table
INSERT INTO core.rule_section (section_id, rule_id, section_order, section_title, content)
SELECT 
    gen_random_uuid() as section_id,
    rm.new_rule_id,
    prs.section_order,
    prs.section_title,
    prs.content
FROM core.rule_section prs
JOIN rule_mapping rm ON rm.old_id = prs.rule_id
WHERE NOT EXISTS (
    SELECT 1 FROM core.rule_section 
    WHERE rule_id = rm.new_rule_id 
    AND section_order = prs.section_order
    AND section_title = prs.section_title
);

-- Step 4: Drop the duplicate padel_rule table and its associated rule_section data
DELETE FROM core.rule_section WHERE rule_id IN (
    SELECT pr.id FROM core.padel_rule pr
);
DROP TABLE IF EXISTS core.padel_rule CASCADE;

-- Step 5: Verify the final consolidation
SELECT 
    'core.rule' as table_name,
    COUNT(*) as record_count
FROM core.rule
UNION ALL
SELECT 
    'core.rule_section' as table_name,
    COUNT(*) as record_count
FROM core.rule_section;

-- Step 6: Show the final consolidated rules
SELECT 
    r.title as rule_title,
    r.order_number,
    COUNT(rs.section_id) as section_count
FROM core.rule r
LEFT JOIN core.rule_section rs ON r.rule_id = rs.rule_id
GROUP BY r.rule_id, r.title, r.order_number
ORDER BY r.order_number;

-- Step 7: Show sample sections for verification
SELECT 
    r.title as rule_title,
    rs.section_title,
    LEFT(rs.content, 50) || '...' as content_preview
FROM core.rule r
JOIN core.rule_section rs ON r.rule_id = rs.rule_id
WHERE r.title LIKE '%Padel%'
ORDER BY r.order_number, rs.section_order
LIMIT 10;
