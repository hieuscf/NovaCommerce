package entity

import (
	"time"

	"github.com/google/uuid"
)

// OutboxEvent represents a domain event persisted to the outbox table.
// A relay process reads pending events and publishes them to Kafka, providing
// at-least-once delivery without a two-phase commit.
type OutboxEvent struct {
	ID          uuid.UUID  `db:"id"`
	Topic       string     `db:"topic"`
	Key         string     `db:"key"`
	Payload     []byte     `db:"payload"`
	CreatedAt   time.Time  `db:"created_at"`
	ProcessedAt *time.Time `db:"processed_at"`
}
