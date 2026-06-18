package messaging

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	pkgkafka "github.com/novacommerce/pkg/kafka"
	pkglogger "github.com/novacommerce/pkg/logger"
	"github.com/prometheus/client_golang/prometheus"
)

const (
	defaultOutboxInterval  = time.Second
	defaultOutboxBatchSize = 100
	maxOutboxRetries       = 5
)

var outboxPendingGauge = prometheus.NewGauge(prometheus.GaugeOpts{
	Name: "catalog_outbox_pending_total",
	Help: "Number of pending outbox events waiting to be published",
})

func init() {
	prometheus.MustRegister(outboxPendingGauge)
}

type outboxEventRow struct {
	ID      uuid.UUID
	Topic   string
	Key     string
	Payload []byte
}

type kafkaPublisher interface {
	PublishBytes(ctx context.Context, topic, key string, payload []byte) error
}

// OutboxWorker relays pending outbox events to Kafka.
type OutboxWorker struct {
	db       *pgxpool.Pool
	producer kafkaPublisher
	logger   *pkglogger.Logger
	interval time.Duration
}

// NewOutboxWorker creates an OutboxWorker.
func NewOutboxWorker(pool *pgxpool.Pool, producer *pkgkafka.Producer, logger *pkglogger.Logger, interval time.Duration) *OutboxWorker {
	if interval <= 0 {
		interval = defaultOutboxInterval
	}
	return &OutboxWorker{
		db:       pool,
		producer: producer,
		logger:   logger,
		interval: interval,
	}
}

// Run polls and publishes outbox events until ctx is cancelled.
func (w *OutboxWorker) Run(ctx context.Context) error {
	ticker := time.NewTicker(w.interval)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-ticker.C:
			if err := w.processBatch(ctx); err != nil && w.logger != nil {
				w.logger.Error().Err(err).Msg("outbox worker batch failed")
			}
		}
	}
}

// ProcessOnce processes a single outbox batch (useful for tests).
func (w *OutboxWorker) ProcessOnce(ctx context.Context) error {
	return w.processBatch(ctx)
}

func (w *OutboxWorker) processBatch(ctx context.Context) error {
	if err := w.refreshPendingGauge(ctx); err != nil && w.logger != nil {
		w.logger.Warn().Err(err).Msg("refresh outbox pending gauge failed")
	}

	tx, err := w.db.Begin(ctx)
	if err != nil {
		return fmt.Errorf("begin outbox batch transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	rows, err := tx.Query(ctx, `
		SELECT id, topic, key, payload
		FROM outbox_events
		WHERE status = 'pending' AND retry_count < $1
		ORDER BY created_at ASC
		LIMIT $2
		FOR UPDATE SKIP LOCKED`, maxOutboxRetries, defaultOutboxBatchSize)
	if err != nil {
		return fmt.Errorf("select pending outbox events: %w", err)
	}

	events, err := scanOutboxRows(rows)
	rows.Close()
	if err != nil {
		return err
	}
	if len(events) == 0 {
		return tx.Commit(ctx)
	}

	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("commit outbox claim transaction: %w", err)
	}

	for _, event := range events {
		if err := w.publishEvent(ctx, event); err != nil && w.logger != nil {
			w.logger.Error().Err(err).Str("event_id", event.ID.String()).Msg("publish outbox event failed")
		}
	}

	return w.refreshPendingGauge(ctx)
}

func (w *OutboxWorker) publishEvent(ctx context.Context, event outboxEventRow) error {
	if err := w.producer.PublishBytes(ctx, event.Topic, event.Key, event.Payload); err != nil {
		retryCount, updateErr := w.incrementRetry(ctx, event.ID)
		if updateErr != nil {
			return fmt.Errorf("increment retry for %s: %w", event.ID, updateErr)
		}
		if retryCount >= maxOutboxRetries && w.logger != nil {
			w.logger.Error().
				Str("event_id", event.ID.String()).
				Str("topic", event.Topic).
				Str("key", event.Key).
				RawJSON("payload", event.Payload).
				Msg("outbox event exceeded max retries")
		}
		return err
	}

	tag, err := w.db.Exec(ctx, `
		UPDATE outbox_events
		SET status = 'sent', processed_at = NOW()
		WHERE id = $1`, event.ID)
	if err != nil {
		return fmt.Errorf("mark outbox event sent %s: %w", event.ID, err)
	}
	if tag.RowsAffected() == 0 {
		return fmt.Errorf("outbox event %s not found", event.ID)
	}

	if w.logger != nil {
		w.logger.Debug().
			Str("event_id", event.ID.String()).
			Str("topic", event.Topic).
			Str("key", event.Key).
			Msg("outbox event published")
	}
	return nil
}

func (w *OutboxWorker) incrementRetry(ctx context.Context, id uuid.UUID) (int, error) {
	var retryCount int
	err := w.db.QueryRow(ctx, `
		UPDATE outbox_events
		SET retry_count = retry_count + 1
		WHERE id = $1
		RETURNING retry_count`, id).Scan(&retryCount)
	if err != nil {
		return 0, err
	}
	return retryCount, nil
}

func (w *OutboxWorker) refreshPendingGauge(ctx context.Context) error {
	var pending int64
	if err := w.db.QueryRow(ctx, `
		SELECT COUNT(*) FROM outbox_events WHERE status = 'pending'`).Scan(&pending); err != nil {
		return err
	}
	outboxPendingGauge.Set(float64(pending))
	return nil
}

func scanOutboxRows(rows pgx.Rows) ([]outboxEventRow, error) {
	var events []outboxEventRow
	for rows.Next() {
		var event outboxEventRow
		if err := rows.Scan(&event.ID, &event.Topic, &event.Key, &event.Payload); err != nil {
			return nil, fmt.Errorf("scan outbox event: %w", err)
		}
		events = append(events, event)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate outbox events: %w", err)
	}
	return events, nil
}

// ValidateKafkaBrokers performs a lightweight metadata check against Kafka brokers.
func ValidateKafkaBrokers(brokers []string) error {
	if len(brokers) == 0 {
		return fmt.Errorf("no kafka brokers configured")
	}
	producer, err := pkgkafka.NewProducer(pkgkafka.ProducerConfig{Brokers: brokers})
	if err != nil {
		return err
	}
	defer producer.Close()
	return nil
}

// DecodeProductEventKey extracts product_id from an outbox payload for logging/tests.
func DecodeProductEventKey(payload []byte) (string, error) {
	var body struct {
		ProductID string `json:"product_id"`
	}
	if err := json.Unmarshal(payload, &body); err != nil {
		return "", err
	}
	return body.ProductID, nil
}
