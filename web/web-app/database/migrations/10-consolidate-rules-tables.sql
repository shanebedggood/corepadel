-- Migration: Consolidate rules tables properly
-- This script consolidates all rules data into the existing core.rule structure

-- Set search path to include core schema
SET search_path TO core, public;

-- Step 1: Drop the duplicate padel_rule table we created
DROP TABLE IF EXISTS core.padel_rule CASCADE;

-- Step 2: Insert data from public schema into existing core.rule table
INSERT INTO core.rule (rule_id, title, order_number)
SELECT 
    gen_random_uuid() as rule_id,
    title,
    order_number
FROM (
    SELECT DISTINCT title, order_number
    FROM public.padel_rule
    WHERE NOT EXISTS (
        SELECT 1 FROM core.rule WHERE core.rule.title = public.padel_rule.title
    )
) AS new_rules
ON CONFLICT (title) DO NOTHING;

-- Step 3: Insert rule sections into existing core.rule_section table
-- First, we need to map the public schema rule IDs to core schema rule IDs
INSERT INTO core.rule_section (section_id, rule_id, section_order, section_title, content)
SELECT 
    gen_random_uuid() as section_id,
    cr.rule_id,
    prs.section_order,
    prs.section_title,
    prs.content
FROM public.rule_section prs
JOIN public.padel_rule pr ON pr.id = prs.rule_id
JOIN core.rule cr ON cr.title = pr.title
WHERE NOT EXISTS (
    SELECT 1 FROM core.rule_section 
    WHERE rule_id = cr.rule_id 
    AND section_order = prs.section_order
);

-- Step 4: Verify the consolidation
SELECT 
    'core.rule' as table_name,
    COUNT(*) as record_count
FROM core.rule
UNION ALL
SELECT 
    'core.rule_section' as table_name,
    COUNT(*) as record_count
FROM core.rule_section;

-- Step 5: Show the consolidated rules
SELECT 
    r.title as rule_title,
    r.order_number,
    COUNT(rs.section_id) as section_count
FROM core.rule r
LEFT JOIN core.rule_section rs ON r.rule_id = rs.rule_id
GROUP BY r.rule_id, r.title, r.order_number
ORDER BY r.order_number;

-- Step 6: Show sample sections
SELECT 
    r.title as rule_title,
    rs.section_title,
    rs.content
FROM core.rule r
JOIN core.rule_section rs ON r.rule_id = rs.rule_id
WHERE r.title = 'Basic Padel Rules'
ORDER BY rs.section_order;
