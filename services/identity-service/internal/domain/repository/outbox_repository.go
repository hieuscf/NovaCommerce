package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/novacommerce/identity-service/internal/domain/entity"
)

// OutboxRepository persists and retrieves outbox events.
// All write operations support the transaction-in-context pattern so they can
// participate in the same DB transaction as the business data they accompany.
type OutboxRepository interface {
	// Create inserts a new pending outbox event.
	Create(ctx context.Context, event *entity.OutboxEvent) error

	// FindPending returns up to limit unprocessed events ordered by created_at ASC.
	FindPending(ctx context.Context, limit int) ([]*entity.OutboxEvent, error)

	// MarkProcessed records the time at which an event was published to Kafka.
	MarkProcessed(ctx context.Context, id uuid.UUID) error
}
