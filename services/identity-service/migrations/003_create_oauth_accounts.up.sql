-- oauth_accounts stores the link between a NovaCommerce user and an external OAuth
-- provider identity (Google, Facebook, GitHub, Apple).
-- access_token and refresh_token MUST be encrypted with AES-256-GCM by the
-- application layer before persisting; the DB stores opaque ciphertext.

CREATE TABLE oauth_accounts (
    id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID         NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    provider         VARCHAR(50)  NOT NULL,
    provider_user_id VARCHAR(255) NOT NULL,
    email            VARCHAR(255) NULL,
    name             VARCHAR(255) NULL,
    avatar_url       TEXT         NULL,
    access_token     TEXT         NULL,
    refresh_token    TEXT         NULL,
    expires_at       TIMESTAMPTZ  NULL,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_oauth_provider_user UNIQUE (provider, provider_user_id)
);

CREATE INDEX idx_oauth_accounts_user_id          ON oauth_accounts (user_id);
CREATE INDEX idx_oauth_accounts_provider_user_id ON oauth_accounts (provider, provider_user_id);

CREATE TRIGGER trg_oauth_accounts_updated_at
    BEFORE UPDATE ON oauth_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
