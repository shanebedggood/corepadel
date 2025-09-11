-- Insert rule sections for the consolidated rules
-- This script adds the missing sections for Basic Padel Rules, Scoring System, and Court Dimensions

-- Set search path to include core schema
SET search_path TO core, public;

-- Step 1: Insert sections for Basic Padel Rules
INSERT INTO core.rule_section (section_id, rule_id, section_order, section_title, content)
SELECT 
    gen_random_uuid() as section_id,
    r.rule_id,
    section_order,
    section_title,
    content
FROM (
    VALUES 
        (1, 'Introduction', 'The following are the basic rules of padel:'),
        (2, 'a)', 'The ball must be served underhand'),
        (3, 'b)', 'The ball must bounce once before being hit'),
        (4, 'c)', 'The ball must not touch the back wall on the serve'),
        (5, 'd)', 'Players must alternate hits'),
        (6, 'e)', 'The ball can only bounce once per side')
) AS sections(section_order, section_title, content)
CROSS JOIN core.rule r
WHERE r.title = 'Basic Padel Rules'
ON CONFLICT DO NOTHING;

-- Step 2: Insert sections for Scoring System
INSERT INTO core.rule_section (section_id, rule_id, section_order, section_title, content)
SELECT 
    gen_random_uuid() as section_id,
    r.rule_id,
    section_order,
    section_title,
    content
FROM (
    VALUES 
        (1, 'Introduction', 'Padel uses the same scoring system as tennis:'),
        (2, 'a)', 'Points: 15, 30, 40, Game'),
        (3, 'b)', 'Games: First to 6 games with 2 game lead'),
        (4, 'c)', 'Sets: Best of 3 sets'),
        (5, 'd)', 'Tie-break at 6-6 in games')
) AS sections(section_order, section_title, content)
CROSS JOIN core.rule r
WHERE r.title = 'Scoring System'
ON CONFLICT DO NOTHING;

-- Step 3: Insert sections for Court Dimensions
INSERT INTO core.rule_section (section_id, rule_id, section_order, section_title, content)
SELECT 
    gen_random_uuid() as section_id,
    r.rule_id,
    section_order,
    section_title,
    content
FROM (
    VALUES 
        (1, 'Introduction', 'Standard padel court dimensions:'),
        (2, 'a)', 'Length: 20 meters'),
        (3, 'b)', 'Width: 10 meters'),
        (4, 'c)', 'Height: 3 meters minimum'),
        (5, 'd)', 'Service boxes: 6.95m x 3.5m')
) AS sections(section_order, section_title, content)
CROSS JOIN core.rule r
WHERE r.title = 'Court Dimensions'
ON CONFLICT DO NOTHING;

-- Step 4: Verify the sections were added
SELECT 
    r.title as rule_title,
    COUNT(rs.section_id) as section_count
FROM core.rule r
LEFT JOIN core.rule_section rs ON r.rule_id = rs.rule_id
WHERE r.title IN ('Basic Padel Rules', 'Scoring System', 'Court Dimensions')
GROUP BY r.rule_id, r.title
ORDER BY r.order_number;

-- Step 5: Show sample sections for verification
SELECT 
    r.title as rule_title,
    rs.section_title,
    rs.content
FROM core.rule r
JOIN core.rule_section rs ON r.rule_id = rs.rule_id
WHERE r.title = 'Basic Padel Rules'
ORDER BY rs.section_order;
