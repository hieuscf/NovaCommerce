package kafka

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/IBM/sarama"
	pkglogger "github.com/novacommerce/pkg/logger"
)

const (
	defaultMaxRetries   = 3
	defaultRetryBackoff = 100 * time.Millisecond
)

// ProducerConfig configures the Kafka sync producer.
type ProducerConfig struct {
	Brokers      []string
	MaxRetries   int
	RetryBackoff time.Duration
	ServiceName  string
}

// Message represents a Kafka message to publish.
type Message struct {
	Topic   string
	Key     string
	Payload interface{}
	Headers map[string]string
}

// Producer publishes messages to Kafka with retry support.
type Producer struct {
	producer    saramaSyncProducer
	cfg         ProducerConfig
	serviceName string
}

type saramaSyncProducer interface {
	SendMessage(msg *sarama.ProducerMessage) (partition int32, offset int64, err error)
	SendMessages(msgs []*sarama.ProducerMessage) error
	Close() error
}

// NewProducer creates a sync Kafka producer.
func NewProducer(cfg ProducerConfig) (*Producer, error) {
	if len(cfg.Brokers) == 0 {
		return nil, fmt.Errorf("at least one broker is required")
	}
	if cfg.MaxRetries <= 0 {
		cfg.MaxRetries = defaultMaxRetries
	}
	if cfg.RetryBackoff <= 0 {
		cfg.RetryBackoff = defaultRetryBackoff
	}

	config := sarama.NewConfig()
	config.Producer.Return.Successes = true
	config.Producer.RequiredAcks = sarama.WaitForAll
	config.Producer.Retry.Max = cfg.MaxRetries

	producer, err := sarama.NewSyncProducer(cfg.Brokers, config)
	if err != nil {
		return nil, fmt.Errorf("create kafka producer: %w", err)
	}

	return &Producer{
		producer:    producer,
		cfg:         cfg,
		serviceName: cfg.ServiceName,
	}, nil
}

func newProducerWithSyncProducer(producer saramaSyncProducer, cfg ProducerConfig) *Producer {
	if cfg.MaxRetries <= 0 {
		cfg.MaxRetries = defaultMaxRetries
	}
	if cfg.RetryBackoff <= 0 {
		cfg.RetryBackoff = defaultRetryBackoff
	}
	return &Producer{
		producer:    producer,
		cfg:         cfg,
		serviceName: cfg.ServiceName,
	}
}

// Publish sends a single message to Kafka.
func (p *Producer) Publish(ctx context.Context, msg Message) error {
	producerMsg, err := p.buildProducerMessage(ctx, msg)
	if err != nil {
		return err
	}
	return p.sendWithRetry(producerMsg)
}

// PublishBatch sends multiple messages to Kafka.
func (p *Producer) PublishBatch(ctx context.Context, msgs []Message) error {
	if len(msgs) == 0 {
		return nil
	}

	producerMsgs := make([]*sarama.ProducerMessage, 0, len(msgs))
	for _, msg := range msgs {
		producerMsg, err := p.buildProducerMessage(ctx, msg)
		if err != nil {
			return err
		}
		producerMsgs = append(producerMsgs, producerMsg)
	}

	return p.sendBatchWithRetry(producerMsgs)
}

// Close closes the underlying producer.
func (p *Producer) Close() error {
	if p == nil || p.producer == nil {
		return nil
	}
	return p.producer.Close()
}

func (p *Producer) buildProducerMessage(ctx context.Context, msg Message) (*sarama.ProducerMessage, error) {
	if msg.Topic == "" {
		return nil, fmt.Errorf("message topic is required")
	}

	payload, err := json.Marshal(msg.Payload)
	if err != nil {
		return nil, fmt.Errorf("marshal message payload: %w", err)
	}

	headers := buildRecordHeaders(msg.Headers)
	headers = append(headers,
		sarama.RecordHeader{Key: []byte("Content-Type"), Value: []byte("application/json")},
		sarama.RecordHeader{Key: []byte("X-Timestamp"), Value: []byte(time.Now().UTC().Format(time.RFC3339))},
	)

	if requestID := pkglogger.RequestIDFromContext(ctx); requestID != "" {
		headers = append(headers, sarama.RecordHeader{Key: []byte("X-Request-ID"), Value: []byte(requestID)})
	}
	if p.serviceName != "" {
		headers = append(headers, sarama.RecordHeader{Key: []byte("X-Service-Name"), Value: []byte(p.serviceName)})
	}

	producerMsg := &sarama.ProducerMessage{
		Topic:   msg.Topic,
		Key:     sarama.StringEncoder(msg.Key),
		Value:   sarama.ByteEncoder(payload),
		Headers: headers,
	}
	return producerMsg, nil
}

func buildRecordHeaders(headers map[string]string) []sarama.RecordHeader {
	if len(headers) == 0 {
		return nil
	}

	result := make([]sarama.RecordHeader, 0, len(headers))
	for key, value := range headers {
		result = append(result, sarama.RecordHeader{
			Key:   []byte(key),
			Value: []byte(value),
		})
	}
	return result
}

func (p *Producer) sendWithRetry(msg *sarama.ProducerMessage) error {
	var lastErr error
	backoff := p.cfg.RetryBackoff

	for attempt := 0; attempt <= p.cfg.MaxRetries; attempt++ {
		_, _, err := p.producer.SendMessage(msg)
		if err == nil {
			return nil
		}
		lastErr = err
		if attempt < p.cfg.MaxRetries {
			time.Sleep(backoff)
			backoff *= 2
		}
	}

	return fmt.Errorf("publish message: %w", lastErr)
}

func (p *Producer) sendBatchWithRetry(msgs []*sarama.ProducerMessage) error {
	var lastErr error
	backoff := p.cfg.RetryBackoff

	for attempt := 0; attempt <= p.cfg.MaxRetries; attempt++ {
		err := p.producer.SendMessages(msgs)
		if err == nil {
			return nil
		}
		lastErr = err
		if attempt < p.cfg.MaxRetries {
			time.Sleep(backoff)
			backoff *= 2
		}
	}

	return fmt.Errorf("publish batch: %w", lastErr)
}
