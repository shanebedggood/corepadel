-- User table to store Firebase user information
CREATE TABLE IF NOT EXISTS core.user (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firebase_uid VARCHAR(255) NOT NULL UNIQUE, -- Firebase user ID
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(255) NOT NULL UNIQUE,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    display_name VARCHAR(255),
    mobile VARCHAR(50),
    rating INTEGER DEFAULT 0,
    profile_picture VARCHAR(500),
    email_verified BOOLEAN DEFAULT false
);

-- User roles table to store Firebase roles
CREATE TABLE IF NOT EXISTS core.user_role (
    role_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES core.user(user_id) ON DELETE CASCADE,
    role_name VARCHAR(100) NOT NULL, -- 'player', 'admin', etc.
    
    UNIQUE(user_id, role_name)
);

-- User club membership table
CREATE TABLE IF NOT EXISTS core.user_club (
    membership_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES core.user(user_id) ON DELETE CASCADE,
    club_id UUID NOT NULL REFERENCES core.club(club_id) ON DELETE CASCADE,
    role VARCHAR(100) DEFAULT 'member', -- 'member', 'admin', 'owner'
    
    UNIQUE(user_id, club_id)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_firebase_uid ON core.user (firebase_uid);
CREATE INDEX IF NOT EXISTS idx_user_email ON core.user (email);
CREATE INDEX IF NOT EXISTS idx_user_username ON core.user (username);
