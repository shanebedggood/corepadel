-- Rollback and recreate tables with correct structure
-- This script drops the existing tables and recreates them with the correct column names

-- Step 1: Drop existing tables (in reverse order due to foreign key constraints)
DROP TABLE IF EXISTS rule_section CASCADE;
DROP TABLE IF EXISTS padel_rule CASCADE;

-- Step 2: Recreate padel_rule table with correct structure
CREATE TABLE IF NOT EXISTS padel_rule (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    order_number INTEGER,
    rule_description TEXT, -- Legacy field for existing data
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_padel_rule_order ON padel_rule(order_number);
CREATE INDEX IF NOT EXISTS idx_padel_rule_title ON padel_rule(title);

-- Step 3: Insert sample rules
INSERT INTO padel_rule (title, order_number, rule_description, created_at, updated_at)
SELECT * FROM (VALUES 
    ('Basic Padel Rules', 1, '["The following are the basic rules of padel:", "a) The ball must be served underhand", "b) The ball must bounce once before being hit", "c) The ball must not touch the back wall on the serve", "d) Players must alternate hits", "e) The ball can only bounce once per side"]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Scoring System', 2, '["Padel uses the same scoring system as tennis:", "a) Points: 15, 30, 40, Game", "b) Games: First to 6 games with 2 game lead", "c) Sets: Best of 3 sets", "d) Tie-break at 6-6 in games"]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Court Dimensions', 3, '["Standard padel court dimensions:", "a) Length: 20 meters", "b) Width: 10 meters", "c) Height: 3 meters minimum", "d) Service boxes: 6.95m x 3.5m"]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
) AS v(title, order_number, rule_description, created_at, updated_at);

-- Step 4: Create rule_section table with correct structure
CREATE TABLE IF NOT EXISTS rule_section (
    id BIGSERIAL PRIMARY KEY,
    rule_id BIGINT NOT NULL REFERENCES padel_rule(id) ON DELETE CASCADE,
    section_order INTEGER NOT NULL,
    section_title VARCHAR(100),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_rule_section_rule_id ON rule_section(rule_id);
CREATE INDEX IF NOT EXISTS idx_rule_section_order ON rule_section(rule_id, section_order);

-- Step 5: Migrate the data
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

-- Step 6: Execute the migration
SELECT migrate_rule_descriptions();

-- Step 7: Clean up the function
DROP FUNCTION migrate_rule_descriptions();

-- Step 8: Verify the migration
SELECT 
    r.title as rule_title,
    COUNT(rs.id) as section_count,
    array_agg(rs.section_title ORDER BY rs.section_order) as section_titles
FROM padel_rule r
LEFT JOIN rule_section rs ON r.id = rs.rule_id
GROUP BY r.id, r.title
ORDER BY r.order_number;
