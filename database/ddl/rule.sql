CREATE TABLE IF NOT EXISTS core.rule (
    rule_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL UNIQUE,
    order_number INTEGER,
	rule_description TEXT
);

-- Index on venue name for quick lookups
CREATE INDEX IF NOT EXISTS idx_order_number ON core.rule (order_number);