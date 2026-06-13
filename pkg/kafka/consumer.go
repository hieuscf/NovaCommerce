package kafka

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/IBM/sarama"
)

// ConsumerConfig configures a Kafka consumer group.
type ConsumerConfig struct {
	Brokers       []string
	GroupID       string
	Topics        []string
	AutoCommit    bool
	InitialOffset int64
}

// ConsumedMessage represents a message consumed from Kafka.
type ConsumedMessage struct {
	Topic     string
	Partition int32
	Offset    int64
	Key       string
	Value     []byte
	Headers   map[string]string
	Timestamp time.Time
}

// HandlerFunc processes a consumed Kafka message.
type HandlerFunc func(ctx context.Context, msg ConsumedMessage) error

// Consumer consumes messages from Kafka using a consumer group.
type Consumer struct {
	group saramaConsumerGroup
	cfg   ConsumerConfig
}

type saramaConsumerGroup interface {
	Consume(ctx context.Context, topics []string, handler sarama.ConsumerGroupHandler) error
	Close() error
}

// NewConsumer creates a Kafka consumer group client.
func NewConsumer(cfg ConsumerConfig) (*Consumer, error) {
	if len(cfg.Brokers) == 0 {
		return nil, fmt.Errorf("at least one broker is required")
	}
	if cfg.GroupID == "" {
		return nil, fmt.Errorf("consumer group ID is required")
	}
	if len(cfg.Topics) == 0 {
		return nil, fmt.Errorf("at least one topic is required")
	}
	if cfg.InitialOffset == 0 {
		cfg.InitialOffset = sarama.OffsetNewest
	}

	config := sarama.NewConfig()
	config.Consumer.Group.Rebalance.Strategy = sarama.NewBalanceStrategyRoundRobin()
	config.Consumer.Offsets.Initial = cfg.InitialOffset
	config.Consumer.Offsets.AutoCommit.Enable = cfg.AutoCommit

	group, err := sarama.NewConsumerGroup(cfg.Brokers, cfg.GroupID, config)
	if err != nil {
		return nil, fmt.Errorf("create kafka consumer group: %w", err)
	}

	return &Consumer{group: group, cfg: cfg}, nil
}

func newConsumerWithGroup(group saramaConsumerGroup, cfg ConsumerConfig) *Consumer {
	return &Consumer{group: group, cfg: cfg}
}

// Start consumes messages until the context is cancelled.
func (c *Consumer) Start(ctx context.Context, handler HandlerFunc) error {
	if c == nil || c.group == nil {
		return fmt.Errorf("consumer is not initialized")
	}

	groupHandler := &consumerGroupHandler{
		handler:    handler,
		autoCommit: c.cfg.AutoCommit,
	}

	for {
		if err := ctx.Err(); err != nil {
			return nil
		}

		if err := c.group.Consume(ctx, c.cfg.Topics, groupHandler); err != nil {
			return fmt.Errorf("consume messages: %w", err)
		}
	}
}

// Close closes the consumer group.
func (c *Consumer) Close() error {
	if c == nil || c.group == nil {
		return nil
	}
	return c.group.Close()
}

type consumerGroupHandler struct {
	handler    HandlerFunc
	autoCommit bool
}

func (h *consumerGroupHandler) Setup(_ sarama.ConsumerGroupSession) error   { return nil }
func (h *consumerGroupHandler) Cleanup(_ sarama.ConsumerGroupSession) error { return nil }

func (h *consumerGroupHandler) ConsumeClaim(session sarama.ConsumerGroupSession, claim sarama.ConsumerGroupClaim) error {
	for {
		select {
		case <-session.Context().Done():
			return nil
		case msg, ok := <-claim.Messages():
			if !ok {
				return nil
			}

			if err := processMessage(session, msg, h.handler, h.autoCommit); err != nil {
				log.Printf("[kafka] message handler error topic=%s partition=%d offset=%d: %v",
					msg.Topic, msg.Partition, msg.Offset, err)
				continue
			}
		}
	}
}

func processMessage(
	session sarama.ConsumerGroupSession,
	msg *sarama.ConsumerMessage,
	handler HandlerFunc,
	autoCommit bool,
) error {
	consumed := toConsumedMessage(msg)
	if err := handler(session.Context(), consumed); err != nil {
		return err
	}

	if !autoCommit {
		session.MarkMessage(msg, "")
		session.Commit()
	}
	return nil
}

func toConsumedMessage(msg *sarama.ConsumerMessage) ConsumedMessage {
	headers := make(map[string]string, len(msg.Headers))
	for _, header := range msg.Headers {
		headers[string(header.Key)] = string(header.Value)
	}

	return ConsumedMessage{
		Topic:     msg.Topic,
		Partition: msg.Partition,
		Offset:    msg.Offset,
		Key:       string(msg.Key),
		Value:     append([]byte(nil), msg.Value...),
		Headers:   headers,
		Timestamp: msg.Timestamp,
	}
}
