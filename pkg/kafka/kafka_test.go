package kafka

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/IBM/sarama"
	"github.com/IBM/sarama/mocks"
	pkglogger "github.com/novacommerce/pkg/logger"
)

func TestProducerPublishSingleMessage(t *testing.T) {
	mockProducer := mocks.NewSyncProducer(t, nil)
	mockProducer.ExpectSendMessageAndSucceed()

	producer := newProducerWithSyncProducer(mockProducer, ProducerConfig{
		MaxRetries:  1,
		ServiceName: "identity-service",
	})

	err := producer.Publish(context.Background(), Message{
		Topic:   "orders.created",
		Key:     "order-1",
		Payload: map[string]string{"id": "order-1"},
	})
	if err != nil {
		t.Fatalf("unexpected publish error: %v", err)
	}
}

func TestProducerPublishBatch(t *testing.T) {
	mockProducer := mocks.NewSyncProducer(t, nil)
	mockProducer.ExpectSendMessageAndSucceed()
	mockProducer.ExpectSendMessageAndSucceed()

	producer := newProducerWithSyncProducer(mockProducer, ProducerConfig{MaxRetries: 1})

	err := producer.PublishBatch(context.Background(), []Message{
		{Topic: "orders.created", Key: "1", Payload: map[string]int{"n": 1}},
		{Topic: "orders.created", Key: "2", Payload: map[string]int{"n": 2}},
	})
	if err != nil {
		t.Fatalf("unexpected batch publish error: %v", err)
	}
}

func TestProducerRetryOnFailure(t *testing.T) {
	mockProducer := mocks.NewSyncProducer(t, nil)
	mockProducer.ExpectSendMessageAndFail(errors.New("temporary failure"))
	mockProducer.ExpectSendMessageAndSucceed()

	producer := newProducerWithSyncProducer(mockProducer, ProducerConfig{
		MaxRetries:   1,
		RetryBackoff: time.Millisecond,
	})

	err := producer.Publish(context.Background(), Message{
		Topic:   "orders.created",
		Key:     "order-1",
		Payload: map[string]string{"id": "order-1"},
	})
	if err != nil {
		t.Fatalf("expected retry success, got %v", err)
	}
}

func TestProducerHeaderInjection(t *testing.T) {
	producer := newProducerWithSyncProducer(mocks.NewSyncProducer(t, nil), ProducerConfig{
		MaxRetries:  1,
		ServiceName: "catalog-service",
	})

	ctx := pkglogger.WithRequestID(context.Background(), "req-123")
	msg, err := producer.buildProducerMessage(ctx, Message{
		Topic:   "products.updated",
		Key:     "product-1",
		Payload: map[string]string{"id": "product-1"},
		Headers: map[string]string{"trace-id": "abc"},
	})
	if err != nil {
		t.Fatalf("unexpected build error: %v", err)
	}

	headers := map[string]string{}
	for _, header := range msg.Headers {
		headers[string(header.Key)] = string(header.Value)
	}

	if headers["Content-Type"] != "application/json" {
		t.Fatal("missing content type header")
	}
	if headers["X-Service-Name"] != "catalog-service" {
		t.Fatal("missing service header")
	}
	if headers["X-Request-ID"] != "req-123" {
		t.Fatal("missing request id header")
	}
	if headers["X-Timestamp"] == "" {
		t.Fatal("missing timestamp header")
	}
	if headers["trace-id"] != "abc" {
		t.Fatal("missing custom header")
	}
}

type mockConsumerGroupSession struct {
	ctx       context.Context
	marked    bool
	committed bool
}

func (m *mockConsumerGroupSession) Claims() map[string][]int32 { return nil }
func (m *mockConsumerGroupSession) MemberID() string           { return "member" }
func (m *mockConsumerGroupSession) GenerationID() int32        { return 1 }
func (m *mockConsumerGroupSession) MarkOffset(string, int32, int64, string) {
}
func (m *mockConsumerGroupSession) ResetOffset(string, int32, int64, string) {}
func (m *mockConsumerGroupSession) MarkMessage(*sarama.ConsumerMessage, string) {
	m.marked = true
}
func (m *mockConsumerGroupSession) Context() context.Context { return m.ctx }
func (m *mockConsumerGroupSession) Commit()                  { m.committed = true }

func TestConsumerCommitsAfterSuccess(t *testing.T) {
	session := &mockConsumerGroupSession{ctx: context.Background()}
	msg := &sarama.ConsumerMessage{
		Topic:     "orders.created",
		Partition: 0,
		Offset:    10,
		Key:       []byte("order-1"),
		Value:     []byte(`{"id":"order-1"}`),
		Timestamp: time.Now(),
	}

	called := false
	err := processMessage(session, msg, func(ctx context.Context, consumed ConsumedMessage) error {
		called = true
		if consumed.Key != "order-1" {
			t.Fatalf("unexpected key: %s", consumed.Key)
		}
		return nil
	}, false)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !called || !session.marked || !session.committed {
		t.Fatalf("expected handler call and commit, called=%v marked=%v committed=%v", called, session.marked, session.committed)
	}
}

func TestConsumerDoesNotCommitAfterError(t *testing.T) {
	session := &mockConsumerGroupSession{ctx: context.Background()}
	msg := &sarama.ConsumerMessage{Topic: "orders.created", Value: []byte(`{}`)}

	err := processMessage(session, msg, func(context.Context, ConsumedMessage) error {
		return errors.New("handler failed")
	}, false)
	if err == nil {
		t.Fatal("expected handler error")
	}
	if session.marked || session.committed {
		t.Fatal("did not expect commit after handler error")
	}
}

func TestToConsumedMessageHeaders(t *testing.T) {
	msg := &sarama.ConsumerMessage{
		Topic: "events",
		Headers: []*sarama.RecordHeader{
			{Key: []byte("X-Request-ID"), Value: []byte("req-1")},
		},
		Value: []byte("payload"),
	}

	consumed := toConsumedMessage(msg)
	if consumed.Headers["X-Request-ID"] != "req-1" {
		t.Fatalf("unexpected headers: %#v", consumed.Headers)
	}
}

func TestNewProducerRequiresBrokers(t *testing.T) {
	if _, err := NewProducer(ProducerConfig{}); err == nil {
		t.Fatal("expected error for missing brokers")
	}
}

func TestNewConsumerValidation(t *testing.T) {
	if _, err := NewConsumer(ConsumerConfig{}); err == nil {
		t.Fatal("expected error for invalid consumer config")
	}
}

func TestPublishRequiresTopic(t *testing.T) {
	producer := newProducerWithSyncProducer(mocks.NewSyncProducer(t, nil), ProducerConfig{MaxRetries: 1})
	if err := producer.Publish(context.Background(), Message{Payload: "x"}); err == nil {
		t.Fatal("expected error for missing topic")
	}
}

func TestPublishBatchEmpty(t *testing.T) {
	producer := newProducerWithSyncProducer(mocks.NewSyncProducer(t, nil), ProducerConfig{MaxRetries: 1})
	if err := producer.PublishBatch(context.Background(), nil); err != nil {
		t.Fatalf("expected nil error for empty batch, got %v", err)
	}
}

func TestProducerClose(t *testing.T) {
	mockProducer := mocks.NewSyncProducer(t, nil)
	producer := newProducerWithSyncProducer(mockProducer, ProducerConfig{MaxRetries: 1})
	if err := producer.Close(); err != nil {
		t.Fatalf("unexpected close error: %v", err)
	}
}

func TestProducerBatchRetryFailure(t *testing.T) {
	mockProducer := mocks.NewSyncProducer(t, nil)
	mockProducer.ExpectSendMessageAndFail(errors.New("batch failed"))
	mockProducer.ExpectSendMessageAndFail(errors.New("batch failed"))

	producer := newProducerWithSyncProducer(mockProducer, ProducerConfig{
		MaxRetries:   1,
		RetryBackoff: time.Millisecond,
	})

	err := producer.PublishBatch(context.Background(), []Message{
		{Topic: "orders.created", Key: "1", Payload: map[string]int{"n": 1}},
	})
	if err == nil {
		t.Fatal("expected batch publish failure")
	}
}

func TestBuildProducerMessageMarshalError(t *testing.T) {
	producer := newProducerWithSyncProducer(mocks.NewSyncProducer(t, nil), ProducerConfig{MaxRetries: 1})
	_, err := producer.buildProducerMessage(context.Background(), Message{
		Topic:   "orders.created",
		Payload: make(chan int),
	})
	if err == nil {
		t.Fatal("expected marshal error")
	}
}

func TestConsumerClose(t *testing.T) {
	consumer := &Consumer{}
	if err := consumer.Close(); err != nil {
		t.Fatalf("unexpected close error: %v", err)
	}
}

func TestConsumerStartWithoutGroup(t *testing.T) {
	consumer := &Consumer{}
	if err := consumer.Start(context.Background(), func(context.Context, ConsumedMessage) error { return nil }); err == nil {
		t.Fatal("expected error for uninitialized consumer")
	}
}

func TestConsumerGroupHandlerLifecycle(t *testing.T) {
	handler := &consumerGroupHandler{
		handler: func(context.Context, ConsumedMessage) error { return nil },
	}
	session := &mockConsumerGroupSession{ctx: context.Background()}

	if err := handler.Setup(session); err != nil {
		t.Fatalf("setup failed: %v", err)
	}
	if err := handler.Cleanup(session); err != nil {
		t.Fatalf("cleanup failed: %v", err)
	}
}

func TestProducerPublishFailureAfterRetries(t *testing.T) {
	mockProducer := mocks.NewSyncProducer(t, nil)
	mockProducer.ExpectSendMessageAndFail(errors.New("temporary failure"))
	mockProducer.ExpectSendMessageAndFail(errors.New("temporary failure"))

	producer := newProducerWithSyncProducer(mockProducer, ProducerConfig{
		MaxRetries:   1,
		RetryBackoff: time.Millisecond,
	})

	err := producer.Publish(context.Background(), Message{
		Topic:   "orders.created",
		Key:     "order-1",
		Payload: map[string]string{"id": "order-1"},
	})
	if err == nil {
		t.Fatal("expected publish failure after retries")
	}
}

type mockConsumerClaim struct {
	messages chan *sarama.ConsumerMessage
}

func (m *mockConsumerClaim) Topic() string              { return "orders.created" }
func (m *mockConsumerClaim) Partition() int32           { return 0 }
func (m *mockConsumerClaim) InitialOffset() int64       { return 0 }
func (m *mockConsumerClaim) HighWaterMarkOffset() int64 { return 1 }
func (m *mockConsumerClaim) Messages() <-chan *sarama.ConsumerMessage {
	return m.messages
}

func TestConsumerGroupHandlerConsumeClaim(t *testing.T) {
	handler := &consumerGroupHandler{
		autoCommit: false,
		handler: func(context.Context, ConsumedMessage) error {
			return nil
		},
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	session := &mockConsumerGroupSession{ctx: ctx}
	claim := &mockConsumerClaim{messages: make(chan *sarama.ConsumerMessage, 1)}
	claim.messages <- &sarama.ConsumerMessage{
		Topic: "orders.created",
		Value: []byte(`{"id":"1"}`),
	}
	close(claim.messages)

	done := make(chan error, 1)
	go func() {
		done <- handler.ConsumeClaim(session, claim)
	}()

	if err := <-done; err != nil {
		t.Fatalf("unexpected consume claim error: %v", err)
	}
	if !session.marked || !session.committed {
		t.Fatal("expected message to be committed")
	}
}

func TestConsumerGroupHandlerStopsOnContextCancel(t *testing.T) {
	handler := &consumerGroupHandler{handler: func(context.Context, ConsumedMessage) error { return nil }}
	ctx, cancel := context.WithCancel(context.Background())
	cancel()

	session := &mockConsumerGroupSession{ctx: ctx}
	claim := &mockConsumerClaim{messages: make(chan *sarama.ConsumerMessage)}

	if err := handler.ConsumeClaim(session, claim); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
}

type mockConsumerGroup struct {
	consumeErr error
}

func (m *mockConsumerGroup) Consume(_ context.Context, _ []string, _ sarama.ConsumerGroupHandler) error {
	return m.consumeErr
}

func (m *mockConsumerGroup) Close() error { return nil }

func TestConsumerStartReturnsOnCancelledContext(t *testing.T) {
	consumer := newConsumerWithGroup(&mockConsumerGroup{consumeErr: context.Canceled}, ConsumerConfig{
		Topics:  []string{"orders.created"},
		GroupID: "group-1",
	})

	ctx, cancel := context.WithCancel(context.Background())
	cancel()

	if err := consumer.Start(ctx, func(context.Context, ConsumedMessage) error { return nil }); err != nil {
		t.Fatalf("expected nil on cancelled context, got %v", err)
	}
}

func TestConsumerStartReturnsConsumeError(t *testing.T) {
	consumer := newConsumerWithGroup(&mockConsumerGroup{consumeErr: errors.New("consume failed")}, ConsumerConfig{
		Topics:  []string{"orders.created"},
		GroupID: "group-1",
	})

	err := consumer.Start(context.Background(), func(context.Context, ConsumedMessage) error { return nil })
	if err == nil {
		t.Fatal("expected consume error")
	}
}

func TestConsumerGroupHandlerSkipsCommitOnHandlerError(t *testing.T) {
	handler := &consumerGroupHandler{
		autoCommit: false,
		handler: func(context.Context, ConsumedMessage) error {
			return errors.New("handler failed")
		},
	}

	session := &mockConsumerGroupSession{ctx: context.Background()}
	claim := &mockConsumerClaim{messages: make(chan *sarama.ConsumerMessage, 1)}
	claim.messages <- &sarama.ConsumerMessage{Topic: "orders.created", Value: []byte(`{}`)}
	close(claim.messages)

	if err := handler.ConsumeClaim(session, claim); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if session.marked || session.committed {
		t.Fatal("did not expect commit after handler error")
	}
}

func TestBuildRecordHeadersEmpty(t *testing.T) {
	if headers := buildRecordHeaders(nil); headers != nil {
		t.Fatalf("expected nil headers, got %#v", headers)
	}
}

func TestNewProducerWithDefaults(t *testing.T) {
	producer := newProducerWithSyncProducer(mocks.NewSyncProducer(t, nil), ProducerConfig{})
	if producer.cfg.MaxRetries != defaultMaxRetries {
		t.Fatalf("expected default max retries, got %d", producer.cfg.MaxRetries)
	}
}

func TestToConsumedMessageFields(t *testing.T) {
	msg := &sarama.ConsumerMessage{
		Topic:     "orders.created",
		Partition: 2,
		Offset:    99,
		Key:       []byte("key"),
		Value:     []byte("value"),
		Timestamp: time.Unix(100, 0),
	}

	consumed := toConsumedMessage(msg)
	if consumed.Partition != 2 || consumed.Offset != 99 || consumed.Key != "key" {
		t.Fatalf("unexpected consumed message: %#v", consumed)
	}
}

func TestNewProducerConnectionFailure(t *testing.T) {
	_, err := NewProducer(ProducerConfig{Brokers: []string{"127.0.0.1:1"}})
	if err == nil {
		t.Fatal("expected producer creation error")
	}
}

func TestNewConsumerConnectionFailure(t *testing.T) {
	_, err := NewConsumer(ConsumerConfig{
		Brokers: []string{"127.0.0.1:1"},
		GroupID: "group-1",
		Topics:  []string{"orders.created"},
	})
	if err == nil {
		t.Fatal("expected consumer creation error")
	}
}

func TestConsumerStartRebalanceLoop(t *testing.T) {
	group := &mockConsumerGroupRebalance{}
	consumer := newConsumerWithGroup(group, ConsumerConfig{
		Topics:  []string{"orders.created"},
		GroupID: "group-1",
	})

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	go func() {
		time.Sleep(10 * time.Millisecond)
		cancel()
	}()

	if err := consumer.Start(ctx, func(context.Context, ConsumedMessage) error { return nil }); err != nil {
		t.Fatalf("expected nil on cancelled context, got %v", err)
	}
	if group.calls == 0 {
		t.Fatal("expected consume to be called")
	}
}

type mockConsumerGroupRebalance struct {
	calls int
}

func (m *mockConsumerGroupRebalance) Consume(ctx context.Context, _ []string, _ sarama.ConsumerGroupHandler) error {
	m.calls++
	return nil
}

func (m *mockConsumerGroupRebalance) Close() error { return nil }

func TestProcessMessageAutoCommit(t *testing.T) {
	session := &mockConsumerGroupSession{ctx: context.Background()}
	msg := &sarama.ConsumerMessage{Topic: "orders.created", Value: []byte(`{}`)}

	if err := processMessage(session, msg, func(context.Context, ConsumedMessage) error { return nil }, true); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if session.marked || session.committed {
		t.Fatal("did not expect manual commit with auto commit enabled")
	}
}
