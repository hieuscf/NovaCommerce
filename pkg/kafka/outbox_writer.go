package kafka

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
)

const outboxStatusPending = "pending"

type txContextKey struct{}

// OutboxMessage is a domain event persisted to the outbox table.
type OutboxMessage struct {
	ID        uuid.UUID
	Topic     string
	Key       string
	Payload   []byte
	CreatedAt time.Time
}

// OutboxWriter persists outbox events within the active database transaction.
type OutboxWriter interface {
	Write(ctx context.Context, msg OutboxMessage) error
}

type outboxExecer interface {
	Exec(ctx context.Context, sql string, args ...any) (pgconn.CommandTag, error)
}

// ContextWithTransaction stores a pgx.Tx in ctx for OutboxWriter and repositories.
func ContextWithTransaction(ctx context.Context, tx pgx.Tx) context.Context {
	return context.WithValue(ctx, txContextKey{}, tx)
}

// TransactionFromContext returns the transaction embedded in ctx, if any.
func TransactionFromContext(ctx context.Context) (pgx.Tx, bool) {
	tx, ok := ctx.Value(txContextKey{}).(pgx.Tx)
	return tx, ok
}

// PostgresOutboxWriter writes outbox rows using the transaction in context when present.
type PostgresOutboxWriter struct {
	pool *pgxpool.Pool
}

// NewPostgresOutboxWriter creates an OutboxWriter backed by PostgreSQL.
func NewPostgresOutboxWriter(pool *pgxpool.Pool) OutboxWriter {
	return &PostgresOutboxWriter{pool: pool}
}

// Write inserts a pending outbox event.
func (w *PostgresOutboxWriter) Write(ctx context.Context, msg OutboxMessage) error {
	if msg.ID == uuid.Nil {
		msg.ID = uuid.New()
	}
	createdAt := msg.CreatedAt
	if createdAt.IsZero() {
		createdAt = time.Now().UTC()
	}

	_, err := w.execer(ctx).Exec(ctx, `
		INSERT INTO outbox_events (id, topic, key, payload, status, retry_count, created_at)
		VALUES ($1, $2, $3, $4, $5, 0, $6)`,
		msg.ID,
		msg.Topic,
		msg.Key,
		msg.Payload,
		outboxStatusPending,
		createdAt,
	)
	if err != nil {
		return fmt.Errorf("outbox writer: %w", err)
	}
	return nil
}

func (w *PostgresOutboxWriter) execer(ctx context.Context) outboxExecer {
	if tx, ok := TransactionFromContext(ctx); ok {
		return tx
	}
	return w.pool
}
