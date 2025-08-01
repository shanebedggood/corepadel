CREATE TABLE IF NOT EXISTS core.address (
    address_id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Unique identifier for the address
    street VARCHAR(255) NOT NULL,
    suburb VARCHAR(255),
    city VARCHAR(255) NOT NULL,
    province VARCHAR(255),
    postal_code VARCHAR(20),
    country VARCHAR(255) NOT NULL
);

-- Index on commonly searched address components for performance
CREATE INDEX IF NOT EXISTS idx_address_city ON core.address (city);
CREATE INDEX IF NOT EXISTS idx_address_province ON core.address (province);

CREATE TABLE IF NOT EXISTS core.venue (
    venue_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    website VARCHAR(255),
	facilities VARCHAR(255),		   
    address_id UUID NOT NULL,

    -- Define the foreign key constraint
    CONSTRAINT fk_address
        FOREIGN KEY (address_id)
        REFERENCES core.address (address_id)
        ON DELETE RESTRICT 
);

-- Index on venue name for quick lookups
CREATE INDEX IF NOT EXISTS idx_venue_name ON core.venue (name);