-- Migration: Create padel_rule table
-- This migration creates the base padel_rule table

-- Step 1: Create the padel_rule table
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

-- Step 2: Insert some sample rules if the table is empty
INSERT INTO padel_rule (title, order_number, rule_description, created_at, updated_at)
SELECT * FROM (VALUES 
    ('Basic Padel Rules', 1, '["The following are the basic rules of padel:", "a) The ball must be served underhand", "b) The ball must bounce once before being hit", "c) The ball must not touch the back wall on the serve", "d) Players must alternate hits", "e) The ball can only bounce once per side"]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Scoring System', 2, '["Padel uses the same scoring system as tennis:", "a) Points: 15, 30, 40, Game", "b) Games: First to 6 games with 2 game lead", "c) Sets: Best of 3 sets", "d) Tie-break at 6-6 in games"]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Court Dimensions', 3, '["Standard padel court dimensions:", "a) Length: 20 meters", "b) Width: 10 meters", "c) Height: 3 meters minimum", "d) Service boxes: 6.95m x 3.5m"]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
) AS v(title, order_number, rule_description, created_at, updated_at)
WHERE NOT EXISTS (SELECT 1 FROM padel_rule);

-- Step 3: Verify the table creation
SELECT 
    id,
    title,
    order_number,
    created_at
FROM padel_rule
ORDER BY order_number;
