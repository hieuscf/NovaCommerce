package messaging

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/novacommerce/identity-service/internal/domain/repository"
	pkgkafka "github.com/novacommerce/pkg/kafka"
	pkglogger "github.com/novacommerce/pkg/logger"
)

const (
	defaultOutboxBatchSize   = 50
	defaultOutboxPollInterval = time.Second
)

// OutboxRelayConfig configures the outbox-to-Kafka relay worker.
type OutboxRelayConfig struct {
	BatchSize    int
	PollInterval time.Duration
}

// kafkaPublisher publishes messages to Kafka.
type kafkaPublisher interface {
	Publish(ctx context.Context, msg pkgkafka.Message) error
}

// OutboxRelay polls pending outbox events and publishes them to Kafka.
type OutboxRelay struct {
	outboxRepo repository.OutboxRepository
	producer   kafkaPublisher
	log        *pkglogger.Logger
	cfg        OutboxRelayConfig
}

// NewOutboxRelay creates an OutboxRelay worker.
func NewOutboxRelay(
	outboxRepo repository.OutboxRepository,
	producer kafkaPublisher,
	log *pkglogger.Logger,
	cfg OutboxRelayConfig,
) *OutboxRelay {
	if cfg.BatchSize <= 0 {
		cfg.BatchSize = defaultOutboxBatchSize
	}
	if cfg.PollInterval <= 0 {
		cfg.PollInterval = defaultOutboxPollInterval
	}

	return &OutboxRelay{
		outboxRepo: outboxRepo,
		producer:   producer,
		log:        log,
		cfg:        cfg,
	}
}

// Run polls the outbox table until ctx is cancelled.
func (r *OutboxRelay) Run(ctx context.Context) error {
	ticker := time.NewTicker(r.cfg.PollInterval)
	defer ticker.Stop()

	for {
		if err := r.processBatch(ctx); err != nil {
			if r.log != nil {
				r.log.Error().Err(err).Msg("outbox relay batch failed")
			}
		}

		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-ticker.C:
		}
	}
}

// ProcessOnce relays a single batch of pending outbox events.
func (r *OutboxRelay) ProcessOnce(ctx context.Context) error {
	return r.processBatch(ctx)
}

func (r *OutboxRelay) processBatch(ctx context.Context) error {
	events, err := r.outboxRepo.FindPending(ctx, r.cfg.BatchSize)
	if err != nil {
		return fmt.Errorf("outboxRelay.processBatch: find pending: %w", err)
	}
	if len(events) == 0 {
		return nil
	}

	for _, event := range events {
		if err := r.publishEvent(ctx, event.ID, event.Topic, event.Key, event.Payload); err != nil {
			return err
		}
	}

	return nil
}

func (r *OutboxRelay) publishEvent(ctx context.Context, id uuid.UUID, topic, key string, payload []byte) error {
	if err := r.producer.Publish(ctx, pkgkafka.Message{
		Topic:   topic,
		Key:     key,
		Payload: json.RawMessage(payload),
	}); err != nil {
		return fmt.Errorf("outboxRelay.publishEvent: publish %s: %w", id, err)
	}

	if err := r.outboxRepo.MarkProcessed(ctx, id); err != nil {
		return fmt.Errorf("outboxRelay.publishEvent: mark processed %s: %w", id, err)
	}

	if r.log != nil {
		r.log.Debug().
			Str("event_id", id.String()).
			Str("topic", topic).
			Str("key", key).
			Msg("outbox event relayed to kafka")
	}

	return nil
}
