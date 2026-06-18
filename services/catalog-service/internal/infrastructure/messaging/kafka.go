package messaging

import (
	"context"
	"fmt"

	"github.com/novacommerce/services/catalog-service/config"
	pkgkafka "github.com/novacommerce/pkg/kafka"
	pkglogger "github.com/novacommerce/pkg/logger"
)

// KafkaClients groups Kafka producer and consumer instances.
type KafkaClients struct {
	Producer *pkgkafka.Producer
	Consumer *pkgkafka.Consumer
}

// NewKafkaClients initializes Kafka producer and consumer via pkg/kafka.
func NewKafkaClients(cfg config.KafkaConfig, serviceName string) (*KafkaClients, error) {
	if len(cfg.Brokers) == 0 {
		return nil, fmt.Errorf("at least one kafka broker is required")
	}

	producer, err := pkgkafka.NewProducer(pkgkafka.ProducerConfig{
		Brokers:     cfg.Brokers,
		ServiceName: serviceName,
	})
	if err != nil {
		return nil, fmt.Errorf("init kafka producer: %w", err)
	}

	consumer, err := pkgkafka.NewConsumer(pkgkafka.ConsumerConfig{
		Brokers: cfg.Brokers,
		GroupID: cfg.GroupID,
		Topics:  cfg.ConsumeTopics,
	})
	if err != nil {
		_ = producer.Close()
		return nil, fmt.Errorf("init kafka consumer: %w", err)
	}

	return &KafkaClients{
		Producer: producer,
		Consumer: consumer,
	}, nil
}

// StartConsumer runs the consumer group until ctx is cancelled.
// The handler is a stub until user-events processing is implemented.
func (k *KafkaClients) StartConsumer(ctx context.Context, log *pkglogger.Logger) {
	if k == nil || k.Consumer == nil {
		return
	}

	go func() {
		log.Info().Msg("starting kafka consumer")
		handler := func(ctx context.Context, msg pkgkafka.ConsumedMessage) error {
			log.Debug().
				Str("topic", msg.Topic).
				Int64("offset", msg.Offset).
				Msg("kafka message received (stub handler)")
			return nil
		}

		if err := k.Consumer.Start(ctx, handler); err != nil && ctx.Err() == nil {
			log.Error().Err(err).Msg("kafka consumer stopped")
		}
	}()
}

// Close shuts down producer and consumer.
func (k *KafkaClients) Close() error {
	if k == nil {
		return nil
	}

	var closeErr error
	if k.Producer != nil {
		if err := k.Producer.Close(); err != nil {
			closeErr = fmt.Errorf("close kafka producer: %w", err)
		}
	}
	if k.Consumer != nil {
		if err := k.Consumer.Close(); err != nil {
			if closeErr != nil {
				return fmt.Errorf("%v; close kafka consumer: %w", closeErr, err)
			}
			return fmt.Errorf("close kafka consumer: %w", err)
		}
	}
	return closeErr
}
