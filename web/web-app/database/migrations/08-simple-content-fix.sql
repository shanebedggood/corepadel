-- Simple fix for rule section content
-- Manually update the content with the correct text

-- Clear existing sections
DELETE FROM rule_section;

-- Insert Basic Padel Rules sections
INSERT INTO rule_section (rule_id, section_order, section_title, content, created_at, updated_at) VALUES
(1, 1, 'Introduction', 'The following are the basic rules of padel:', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 2, 'a)', 'The ball must be served underhand', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 3, 'b)', 'The ball must bounce once before being hit', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 4, 'c)', 'The ball must not touch the back wall on the serve', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 5, 'd)', 'Players must alternate hits', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 6, 'e)', 'The ball can only bounce once per side', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert Scoring System sections
INSERT INTO rule_section (rule_id, section_order, section_title, content, created_at, updated_at) VALUES
(2, 1, 'Introduction', 'Padel uses the same scoring system as tennis:', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 2, 'a)', 'Points: 15, 30, 40, Game', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 3, 'b)', 'Games: First to 6 games with 2 game lead', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 4, 'c)', 'Sets: Best of 3 sets', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 5, 'd)', 'Tie-break at 6-6 in games', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert Court Dimensions sections
INSERT INTO rule_section (rule_id, section_order, section_title, content, created_at, updated_at) VALUES
(3, 1, 'Introduction', 'Standard padel court dimensions:', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 2, 'a)', 'Length: 20 meters', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 3, 'b)', 'Width: 10 meters', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 4, 'c)', 'Height: 3 meters minimum', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 5, 'd)', 'Service boxes: 6.95m x 3.5m', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Verify the content
SELECT 
    r.title as rule_title,
    rs.section_title,
    rs.content
FROM padel_rule r
JOIN rule_section rs ON r.id = rs.rule_id
ORDER BY r.order_number, rs.section_order;
