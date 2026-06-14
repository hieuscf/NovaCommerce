-- Refresh token storage rules:
-- - Never store the raw token; persist only its SHA-256 hash in token_hash.
-- - Run a periodic cleanup job to remove expired tokens.
-- - Use idx_refresh_tokens_expires_at for cleanup:
--   DELETE FROM refresh_tokens WHERE expires_at < NOW() AND status != 'active';

CREATE TYPE token_status AS ENUM (
    'active',
    'revoked',
    'expired'
);

CREATE TABLE refresh_tokens (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    token_hash  VARCHAR(64) NOT NULL,
    device_info JSONB NULL,
    status      token_status NOT NULL DEFAULT 'active',
    expires_at  TIMESTAMPTZ NOT NULL,
    revoked_at  TIMESTAMPTZ NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_refresh_tokens_token_hash ON refresh_tokens (token_hash);
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens (user_id);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens (expires_at);
