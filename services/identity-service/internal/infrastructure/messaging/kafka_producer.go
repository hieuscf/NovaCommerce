package messaging

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/novacommerce/identity-service/internal/application/port"
	pkglogger "github.com/novacommerce/pkg/logger"
	"github.com/segmentio/kafka-go"
	"go.opentelemetry.io/otel/trace"
)

// KafkaProducer publishes messages to Kafka and can be closed on shutdown.
type KafkaProducer struct {
	writer *kafka.Writer
}

// NewKafkaProducer creates a KafkaProducer backed by segmentio/kafka-go.
func NewKafkaProducer(brokers []string) (*KafkaProducer, error) {
	if len(brokers) == 0 {
		return nil, fmt.Errorf("at least one kafka broker is required")
	}

	writer := &kafka.Writer{
		Addr:         kafka.TCP(brokers...),
		Balancer:     &kafka.LeastBytes{},
		RequiredAcks: kafka.RequireAll,
		Async:        false,
	}

	return &KafkaProducer{writer: writer}, nil
}

var _ port.KafkaProducer = (*KafkaProducer)(nil)

func (p *KafkaProducer) Publish(ctx context.Context, topic string, key string, payload interface{}) error {
	value, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("kafkaProducer.Publish: %w", err)
	}

	headers := buildKafkaHeaders(ctx)
	msg := kafka.Message{
		Topic:   topic,
		Key:     []byte(key),
		Value:   value,
		Headers: headers,
	}

	if err := p.writer.WriteMessages(ctx, msg); err != nil {
		return fmt.Errorf("kafkaProducer.Publish: %w", err)
	}

	return nil
}

// Close closes the underlying Kafka writer.
func (p *KafkaProducer) Close() error {
	if p == nil || p.writer == nil {
		return nil
	}
	return p.writer.Close()
}

func buildKafkaHeaders(ctx context.Context) []kafka.Header {
	headers := make([]kafka.Header, 0, 2)

	if traceID := traceIDFromContext(ctx); traceID != "" {
		headers = append(headers, kafka.Header{Key: "trace-id", Value: []byte(traceID)})
	}
	if requestID := pkglogger.RequestIDFromContext(ctx); requestID != "" {
		headers = append(headers, kafka.Header{Key: "X-Request-ID", Value: []byte(requestID)})
	}

	return headers
}

func traceIDFromContext(ctx context.Context) string {
	span := trace.SpanFromContext(ctx)
	if !span.SpanContext().IsValid() {
		return ""
	}
	return span.SpanContext().TraceID().String()
}
