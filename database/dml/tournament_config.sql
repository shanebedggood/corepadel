-- Insert seed data
-- Category
INSERT INTO core.category (name, description) 
VALUES 
    ('Men''s', 'Men''s teams competing two-on-two'),
    ('Women''s', 'Women''s teams competing two-on-two'),
    ('Mixed', 'Mixed teams competing two-on-two'),
    ('Open', 'Open teams competing two-on-two')
ON CONFLICT (name) DO NOTHING;

-- Format
INSERT INTO core.format (name, description, category, max_participants, min_participants, rules)
VALUES ('Single Elimination', 'Teams are eliminated after one loss. The last team standing wins.', 'Elimination', 64, 4,
    '["Teams are eliminated after their first loss.", "Bracket-style tournament progression.", "Final match determines the winner."]'::jsonb),
     ('Double Elimination', 'Teams must lose twice to be eliminated. Provides a second chance for early losers.', 'Elimination', 32, 4, 
    '["Teams must lose twice to be eliminated.", "Losers bracket provides second chance.", "Winners bracket and losers bracket finals determine champion."]'::jsonb),
     ('Round Robin', 'All teams compete against each other. Team with the best record wins.', 'Round Robin', 16, 3,
    '["Each team competes against every other team (within groups if applicable).", "Points or win-loss record determines winner.", "Most wins or highest points wins the tournament."]'::jsonb),
     ('Swiss System', 'Players are paired based on similar scores. Efficient for large tournaments.', 'Swiss', 128, 8, 
    '["Players paired with similar scores", "No player faces the same opponent twice", "Final ranking based on total points"]'::jsonb);

-- Progression Type
INSERT INTO core.progression_type (name, description)
VALUES ('Group based elimination', 'The elimination will be based on groups.'),
VALUES ('Combined elimination', 'The elimination will be based the combined groups.');

-- Registration Type
INSERT INTO core.registration_type (name, description)
VALUES ('Individual', 'Players register individually, teams will be assigned by the tournament organiser.'),
       ('Team', 'Players register as a team.'),
       ('Individual or Team', 'Players register individually or as a team. Individual players will be assigned to a team by the tournament organiser.');

-- Tournament Status
INSERT INTO core.tournament_status (name, description, color, text_color)
VALUES ('Draft', 'Tournament is being planned and configured.', '#6b7280', '#ffffff'),
 ('Registration Open', 'Players can register for the tournament.', '#4ade80', '#374151'),
 ('Registration Closed', 'Registration period has ended, preparing for tournament.', '#eab308', '#374151'),
 ('In Progress', 'Tournament is currently being played.', '#2563eb', '#ffffff'),
 ('Completed', 'Tournament has been completed.', '#9333ea', '#ffffff'),
 ('Cancelled', 'Tournament has been cancelled.', '#ef4444', '#ffffff');

-- Venue Type
INSERT INTO core.venue_type (name, description)
VALUES ('Single Venue', 'Tournament will be at a single venue.'),
 ('Multiple Venues', 'Tournament will be at multiple venues.');

-- Advancement Model
INSERT INTO core.advancement_model (name, description)
VALUES ('Trophy / Plate', 'Top team progress to the trophy, bottom team progress to the plate.'),
 ('Elimination only', 'Only the top team progresses to the next round.');

-- Elimination Bracket Size
INSERT INTO core.elimination_bracket_size (name, description, teams)
VALUES ('Final', '2 teams advance to the final', 2),
 ('Semi-finals', '4 teams advance to the semi-finals', 4),
 ('Quarter-finals', '8 teams advance to the quarter-finals', 8),
 ('Round of 16', '16 teams advance to the round of 16', 16);

-- Teams to Advance (for combined elimination settings)
INSERT INTO core.teams_to_advance (name, description, team_count)
VALUES ('8', '8 teams per group.', 8),
 ('4', '4 teams per group.', 4);
 ('2', '2 teams per group.', 2);
 ('1', '1 team per group.', 1);
