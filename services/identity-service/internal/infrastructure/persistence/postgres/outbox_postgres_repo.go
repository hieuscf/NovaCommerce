package postgres

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/novacommerce/identity-service/internal/domain/entity"
	"github.com/novacommerce/identity-service/internal/domain/repository"
	apperrors "github.com/novacommerce/pkg/errors"
)

const outboxColumns = `id, topic, key, payload, created_at, processed_at`

type outboxPostgresRepo struct {
	pool *pgxpool.Pool
}

// NewOutboxPostgresRepo creates a PostgreSQL-backed OutboxRepository.
func NewOutboxPostgresRepo(pool *pgxpool.Pool) repository.OutboxRepository {
	return &outboxPostgresRepo{pool: pool}
}

// Create inserts a new pending outbox event.
// Runs on the transaction embedded in ctx when present, enabling atomic writes
// alongside the business operation that generated the event.
func (r *outboxPostgresRepo) Create(ctx context.Context, event *entity.OutboxEvent) error {
	query := `
		INSERT INTO outbox_events (id, topic, key, payload, created_at)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING ` + outboxColumns

	db := extractQuerier(ctx, r.pool)
	row := db.QueryRow(ctx, query,
		event.ID,
		event.Topic,
		event.Key,
		event.Payload,
		event.CreatedAt,
	)

	created, err := scanOutboxEvent(row)
	if err != nil {
		return fmt.Errorf("outboxPostgresRepo.Create: %w", err)
	}

	*event = *created
	return nil
}

// FindPending returns up to limit unprocessed events ordered by created_at ASC.
func (r *outboxPostgresRepo) FindPending(ctx context.Context, limit int) ([]*entity.OutboxEvent, error) {
	query := `
		SELECT ` + outboxColumns + `
		FROM   outbox_events
		WHERE  processed_at IS NULL
		ORDER  BY created_at ASC
		LIMIT  $1`

	rows, err := r.pool.Query(ctx, query, limit)
	if err != nil {
		return nil, fmt.Errorf("outboxPostgresRepo.FindPending: %w", err)
	}
	defer rows.Close()

	var events []*entity.OutboxEvent
	for rows.Next() {
		event, err := scanOutboxEvent(rows)
		if err != nil {
			return nil, fmt.Errorf("outboxPostgresRepo.FindPending scan: %w", err)
		}
		events = append(events, event)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("outboxPostgresRepo.FindPending rows: %w", err)
	}
	return events, nil
}

// MarkProcessed records the time at which an event was published to Kafka.
func (r *outboxPostgresRepo) MarkProcessed(ctx context.Context, id uuid.UUID) error {
	tag, err := r.pool.Exec(ctx, `
		UPDATE outbox_events
		SET    processed_at = NOW()
		WHERE  id = $1 AND processed_at IS NULL
	`, id)
	if err != nil {
		return fmt.Errorf("outboxPostgresRepo.MarkProcessed: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return apperrors.NewNotFound("outbox event not found or already processed")
	}
	return nil
}

func scanOutboxEvent(row pgx.Row) (*entity.OutboxEvent, error) {
	var e entity.OutboxEvent
	err := row.Scan(
		&e.ID,
		&e.Topic,
		&e.Key,
		&e.Payload,
		&e.CreatedAt,
		&e.ProcessedAt,
	)
	if err != nil {
		return nil, err
	}
	return &e, nil
}
