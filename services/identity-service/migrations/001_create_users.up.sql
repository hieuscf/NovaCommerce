CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE user_status AS ENUM (
    'active',
    'inactive',
    'banned',
    'pending_verification'
);

CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username      VARCHAR(50) NOT NULL,
    email         VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NULL,
    phone         VARCHAR(20) NULL,
    full_name     VARCHAR(100) NOT NULL,
    avatar_url    TEXT NULL,
    status        user_status NOT NULL DEFAULT 'pending_verification',
    last_login_at TIMESTAMPTZ NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_users_username ON users (username);
CREATE UNIQUE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_status ON users (status);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
