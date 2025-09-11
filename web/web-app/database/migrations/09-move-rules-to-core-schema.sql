-- Migration: Move rules tables from public schema to core schema
-- This script consolidates the rules tables into the core schema for consistency

-- Set search path to include core schema
SET search_path TO core, public;

-- Step 1: Create the tables in core schema if they don't exist
CREATE TABLE IF NOT EXISTS core.padel_rule (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    order_number INTEGER,
    rule_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS core.rule_section (
    id BIGSERIAL PRIMARY KEY,
    rule_id BIGINT NOT NULL REFERENCES core.padel_rule(id) ON DELETE CASCADE,
    section_order INTEGER NOT NULL,
    section_title VARCHAR(100),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 2: Create indexes in core schema
CREATE INDEX IF NOT EXISTS idx_padel_rule_order ON core.padel_rule(order_number);
CREATE INDEX IF NOT EXISTS idx_padel_rule_title ON core.padel_rule(title);
CREATE INDEX IF NOT EXISTS idx_rule_section_rule_id ON core.rule_section(rule_id);
CREATE INDEX IF NOT EXISTS idx_rule_section_order ON core.rule_section(rule_id, section_order);

-- Step 3: Copy data from public schema to core schema
INSERT INTO core.padel_rule (id, title, order_number, rule_description, created_at, updated_at)
SELECT id, title, order_number, rule_description, created_at, updated_at
FROM public.padel_rule
ON CONFLICT (id) DO NOTHING;

INSERT INTO core.rule_section (id, rule_id, section_order, section_title, content, created_at, updated_at)
SELECT id, rule_id, section_order, section_title, content, created_at, updated_at
FROM public.rule_section
ON CONFLICT (id) DO NOTHING;

-- Step 4: Reset sequences in core schema to avoid conflicts
SELECT setval('core.padel_rule_id_seq', (SELECT COALESCE(MAX(id), 0) FROM core.padel_rule));
SELECT setval('core.rule_section_id_seq', (SELECT COALESCE(MAX(id), 0) FROM core.rule_section));

-- Step 5: Drop tables from public schema
DROP TABLE IF EXISTS public.rule_section CASCADE;
DROP TABLE IF EXISTS public.padel_rule CASCADE;

-- Step 6: Verify the migration
SELECT 
    'core.padel_rule' as table_name,
    COUNT(*) as record_count
FROM core.padel_rule
UNION ALL
SELECT 
    'core.rule_section' as table_name,
    COUNT(*) as record_count
FROM core.rule_section;

-- Step 7: Show sample data to verify
SELECT 
    r.title as rule_title,
    COUNT(rs.id) as section_count
FROM core.padel_rule r
LEFT JOIN core.rule_section rs ON r.id = rs.rule_id
GROUP BY r.id, r.title
ORDER BY r.order_number;
