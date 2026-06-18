CREATE TABLE outbox_events (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic        TEXT         NOT NULL,
    key          TEXT         NOT NULL,
    payload      JSONB        NOT NULL,
    status       TEXT         NOT NULL DEFAULT 'pending',
    retry_count  INT          NOT NULL DEFAULT 0,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMPTZ  NULL
);

CREATE INDEX idx_outbox_events_pending ON outbox_events (created_at ASC)
    WHERE processed_at IS NULL;
