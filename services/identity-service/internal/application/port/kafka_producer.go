package port

import "context"

// KafkaProducer publishes domain events to Kafka topics.
type KafkaProducer interface {
	Publish(ctx context.Context, topic string, key string, payload interface{}) error
}
