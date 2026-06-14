CREATE TYPE oauth_provider AS ENUM (
    'google',
    'facebook',
    'github',
    'apple'
);

CREATE TABLE oauth_accounts (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    provider         oauth_provider NOT NULL,
    provider_user_id VARCHAR(255) NOT NULL,
    provider_email   VARCHAR(255) NULL,
    -- access_token and refresh_token must be encrypted with application-level
    -- encryption (AES-256-GCM) before persisting to the database.
    access_token     TEXT NULL,
    refresh_token    TEXT NULL,
    token_expires_at TIMESTAMPTZ NULL,
    raw_profile      JSONB NULL,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_oauth_provider_user ON oauth_accounts (provider, provider_user_id);
CREATE INDEX idx_oauth_user_id ON oauth_accounts (user_id);
CREATE INDEX idx_oauth_provider ON oauth_accounts (provider);

CREATE TRIGGER trg_oauth_accounts_updated_at
    BEFORE UPDATE ON oauth_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
