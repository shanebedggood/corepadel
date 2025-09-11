-- Fix the incorrectly parsed content in rule_section table
-- The previous migration incorrectly extracted only single characters

-- Step 1: Clear the existing sections
DELETE FROM rule_section;

-- Step 2: Recreate the migration function with correct parsing
CREATE OR REPLACE FUNCTION migrate_rule_descriptions_fixed()
RETURNS void AS $$
DECLARE
    rule_record RECORD;
    description_array TEXT[];
    section_content TEXT;
    section_order INTEGER;
    section_title TEXT;
BEGIN
    -- Loop through all existing rules
    FOR rule_record IN SELECT id, rule_description FROM padel_rule WHERE rule_description IS NOT NULL LOOP
        
        -- Parse the JSON array from rule_description
        IF rule_record.rule_description::text LIKE '[%]' THEN
            -- It's a JSON array, parse it
            description_array := string_to_array(
                trim(both '[]' from rule_record.rule_description::text),
                ','
            );
            
            section_order := 1;
            
            -- Process each section
            FOREACH section_content IN ARRAY description_array LOOP
                -- Clean up the content
                section_content := trim(both '"' from trim(section_content));
                
                -- Determine section title based on content
                IF section_content ~ '^[a-z]\)' THEN
                    -- Extract the letter/number identifier (e.g., "a)", "b)", "1.", etc.)
                    section_title := substring(section_content from '^[a-z0-9]+[\)\.]');
                    -- Remove the title from the beginning to get the actual content
                    section_content := trim(substring(section_content from '[^a-z0-9\)\.]+'));
                ELSIF section_order = 1 AND section_content ~ '^The following' THEN
                    -- First section that starts with "The following" is likely an introduction
                    section_title := 'Introduction';
                ELSE
                    -- Default section title
                    section_title := 'Section ' || section_order;
                END IF;
                
                -- Insert the section
                INSERT INTO rule_section (rule_id, section_order, section_title, content)
                VALUES (rule_record.id, section_order, section_title, section_content);
                
                section_order := section_order + 1;
            END LOOP;
            
            RAISE NOTICE 'Migrated rule % with % sections', rule_record.id, section_order - 1;
        ELSE
            -- Single text description, create one section
            INSERT INTO rule_section (rule_id, section_order, section_title, content)
            VALUES (rule_record.id, 1, 'Description', rule_record.rule_description);
            
            RAISE NOTICE 'Migrated rule % with single description', rule_record.id;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Migration completed successfully';
END;
$$ LANGUAGE plpgsql;

-- Step 3: Execute the fixed migration
SELECT migrate_rule_descriptions_fixed();

-- Step 4: Clean up the function
DROP FUNCTION migrate_rule_descriptions_fixed();

-- Step 5: Verify the migration
SELECT 
    r.title as rule_title,
    COUNT(rs.id) as section_count,
    array_agg(rs.section_title ORDER BY rs.section_order) as section_titles
FROM padel_rule r
LEFT JOIN rule_section rs ON r.id = rs.rule_id
GROUP BY r.id, r.title
ORDER BY r.order_number;

-- Step 6: Show sample content
SELECT 
    r.title as rule_title,
    rs.section_title,
    rs.content
FROM padel_rule r
JOIN rule_section rs ON r.id = rs.rule_id
WHERE r.id = 1
ORDER BY rs.section_order;
