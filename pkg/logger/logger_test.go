package logger

import (
	"bytes"
	"context"
	"encoding/json"
	"strings"
	"testing"

	"github.com/rs/zerolog"
)

func TestNewInitializesCorrectly(t *testing.T) {
	log := New("identity-service", "production", "debug")

	if log.Service() != "identity-service" {
		t.Fatalf("expected service identity-service, got %s", log.Service())
	}
	if log.Env() != "production" {
		t.Fatalf("expected env production, got %s", log.Env())
	}
	if log.Zerolog().GetLevel() != zerolog.DebugLevel {
		t.Fatalf("expected debug level, got %v", log.Zerolog().GetLevel())
	}
}

func TestWithRequestIDAndFromContextRoundTrip(t *testing.T) {
	base := New("catalog-service", "production", "info")
	ctx := WithContext(context.Background(), base)
	ctx = WithRequestID(ctx, "req-123")

	log := FromContext(ctx)
	if log.RequestID() != "req-123" {
		t.Fatalf("expected request ID req-123, got %s", log.RequestID())
	}
	if log.Service() != "catalog-service" {
		t.Fatalf("expected service catalog-service, got %s", log.Service())
	}
}

func TestFromContextWithoutLoggerUsesDefault(t *testing.T) {
	log := FromContext(context.Background())
	if log.Service() != "unknown" {
		t.Fatalf("expected default service unknown, got %s", log.Service())
	}
}

func TestProductionOutputIsJSON(t *testing.T) {
	var buf bytes.Buffer
	zlog := zerolog.New(&buf).Level(zerolog.InfoLevel)
	log := &Logger{
		service: "commerce-service",
		env:     "production",
		zlog:    zlog,
	}

	log.Info().Str("event", "started").Msg("service started")

	var entry map[string]interface{}
	if err := json.Unmarshal(buf.Bytes(), &entry); err != nil {
		t.Fatalf("expected JSON output in production, got error: %v", err)
	}
	if entry["service"] != "commerce-service" {
		t.Fatalf("expected service field in JSON, got %v", entry["service"])
	}
}

func TestDevelopmentOutputIsPrettyConsole(t *testing.T) {
	log := New("commerce-service", "development", "info")
	log.Info().Str("event", "started").Msg("service started")

	if log.Env() != "development" {
		t.Fatalf("expected development env, got %s", log.Env())
	}
}

func TestLogIncludesRequestIDWhenPresent(t *testing.T) {
	var buf bytes.Buffer
	zlog := zerolog.New(&buf).Level(zerolog.InfoLevel)
	log := &Logger{
		service:   "engagement-service",
		env:       "production",
		zlog:      zlog,
		requestID: "trace-abc",
	}

	log.Info().Msg("handled request")

	var entry map[string]interface{}
	if err := json.Unmarshal(buf.Bytes(), &entry); err != nil {
		t.Fatalf("failed to parse log output: %v", err)
	}
	if entry["request_id"] != "trace-abc" {
		t.Fatalf("expected request_id trace-abc, got %v", entry["request_id"])
	}
}

func TestLogMethodsReturnEvents(t *testing.T) {
	var buf bytes.Buffer
	zlog := zerolog.New(&buf).Level(zerolog.DebugLevel)
	log := &Logger{
		service: "discovery-service",
		env:     "production",
		zlog:    zlog,
	}

	log.Debug().Msg("debug")
	log.Warn().Msg("warn")
	log.Error().Msg("error")

	output := buf.String()
	if !strings.Contains(output, "debug") || !strings.Contains(output, "warn") || !strings.Contains(output, "error") {
		t.Fatalf("expected all log levels in output, got: %s", output)
	}
}

func TestParseLevelDefaults(t *testing.T) {
	log := New("svc", "production", "unknown-level")
	if log.Zerolog().GetLevel() != zerolog.InfoLevel {
		t.Fatalf("expected default info level, got %v", log.Zerolog().GetLevel())
	}
}

func TestRequestIDFromContext(t *testing.T) {
	if RequestIDFromContext(context.Background()) != "" {
		t.Fatal("expected empty request id")
	}
	ctx := WithRequestID(context.Background(), "rid-1")
	if RequestIDFromContext(ctx) != "rid-1" {
		t.Fatal("expected request id from context")
	}
}
