-- Migration: Create rule_section table and migrate existing rule descriptions
-- This migration restructures rule descriptions from JSON arrays to a proper relational structure

-- Step 1: Create the new rule_section table
CREATE TABLE IF NOT EXISTS rule_section (
    section_id BIGSERIAL PRIMARY KEY,
    rule_id BIGINT NOT NULL REFERENCES padel_rule(id) ON DELETE CASCADE,
    section_order INTEGER NOT NULL,
    section_title VARCHAR(100), -- e.g., "a)", "b)", "c)" or "Introduction", "Main Rules", etc.
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_rule_section_rule_id ON rule_section(rule_id);
CREATE INDEX IF NOT EXISTS idx_rule_section_order ON rule_section(rule_id, section_order);

-- Step 2: Create a function to migrate existing rule descriptions
CREATE OR REPLACE FUNCTION migrate_rule_descriptions()
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

-- Step 3: Execute the migration
SELECT migrate_rule_descriptions();

-- Step 4: Clean up the function
DROP FUNCTION migrate_rule_descriptions();

-- Step 5: Verify the migration
SELECT 
    r.title as rule_title,
    COUNT(rs.section_id) as section_count,
    array_agg(rs.section_title ORDER BY rs.section_order) as section_titles
FROM padel_rule r
LEFT JOIN rule_section rs ON r.id = rs.rule_id
GROUP BY r.id, r.title
ORDER BY r.order_number;
