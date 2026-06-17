//go:build unit

package messaging_test

import (
	"context"
	"encoding/json"
	"testing"

	"github.com/google/uuid"
	"github.com/novacommerce/identity-service/internal/domain/entity"
	"github.com/novacommerce/identity-service/internal/infrastructure/messaging"
	pkgkafka "github.com/novacommerce/pkg/kafka"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type stubOutboxRepo struct {
	pending   []*entity.OutboxEvent
	processed []uuid.UUID
}

func (s *stubOutboxRepo) Create(ctx context.Context, event *entity.OutboxEvent) error {
	return nil
}

func (s *stubOutboxRepo) FindPending(ctx context.Context, limit int) ([]*entity.OutboxEvent, error) {
	if len(s.pending) == 0 {
		return nil, nil
	}
	if limit > len(s.pending) {
		limit = len(s.pending)
	}
	return s.pending[:limit], nil
}

func (s *stubOutboxRepo) MarkProcessed(ctx context.Context, id uuid.UUID) error {
	s.processed = append(s.processed, id)
	return nil
}

type stubKafkaPublisher struct {
	messages []pkgkafka.Message
}

func (s *stubKafkaPublisher) Publish(ctx context.Context, msg pkgkafka.Message) error {
	s.messages = append(s.messages, msg)
	return nil
}

func TestOutboxRelay_PublishesPendingEvents(t *testing.T) {
	eventID := uuid.New()
	userID := uuid.New()
	payload, err := json.Marshal(map[string]any{
		"type":           "USER_UPDATED",
		"user_id":        userID.String(),
		"changed_fields": []string{"full_name"},
	})
	require.NoError(t, err)

	repo := &stubOutboxRepo{
		pending: []*entity.OutboxEvent{{
			ID:      eventID,
			Topic:   "user-events",
			Key:     userID.String(),
			Payload: payload,
		}},
	}

	publisher := &stubKafkaPublisher{}
	relay := messaging.NewOutboxRelay(repo, publisher, nil, messaging.OutboxRelayConfig{BatchSize: 10})

	require.NoError(t, relay.ProcessOnce(context.Background()))

	require.Len(t, publisher.messages, 1)
	assert.Equal(t, "user-events", publisher.messages[0].Topic)
	assert.Equal(t, userID.String(), publisher.messages[0].Key)
	require.Len(t, repo.processed, 1)
	assert.Equal(t, eventID, repo.processed[0])
}
