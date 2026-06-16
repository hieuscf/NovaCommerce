-- outbox_events stores domain events that must be published to Kafka atomically
-- with the business operation that generated them (Transactional Outbox Pattern).
-- A relay process polls this table and forwards pending events to Kafka.

CREATE TABLE outbox_events (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    topic        VARCHAR(255) NOT NULL,
    key          VARCHAR(255) NOT NULL,
    payload      JSONB        NOT NULL,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMPTZ  NULL
);

-- Partial index: the relay only needs to scan unprocessed rows.
CREATE INDEX idx_outbox_events_pending ON outbox_events (created_at ASC)
    WHERE processed_at IS NULL;
