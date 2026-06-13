package logger

import (
	"context"
	"io"
	"os"
	"strings"
	"time"

	"github.com/rs/zerolog"
)

type contextKey string

const (
	requestIDKey contextKey = "request_id"
	loggerKey    contextKey = "logger"
)

// Logger wraps zerolog with service metadata and request ID support.
type Logger struct {
	service   string
	env       string
	zlog      zerolog.Logger
	requestID string
}

// New creates a Logger configured for the given service, environment, and level.
func New(service, env, level string) *Logger {
	lvl := parseLevel(level)

	var output io.Writer = os.Stdout
	if strings.EqualFold(env, "development") {
		output = zerolog.ConsoleWriter{
			Out:        os.Stdout,
			TimeFormat: time.RFC3339,
		}
	}

	zlog := zerolog.New(output).
		Level(lvl).
		With().
		Timestamp().
		Str("service", service).
		Logger()

	return &Logger{
		service: service,
		env:     env,
		zlog:    zlog,
	}
}

func parseLevel(level string) zerolog.Level {
	switch strings.ToLower(level) {
	case "debug":
		return zerolog.DebugLevel
	case "warn", "warning":
		return zerolog.WarnLevel
	case "error":
		return zerolog.ErrorLevel
	case "trace":
		return zerolog.TraceLevel
	default:
		return zerolog.InfoLevel
	}
}

func (l *Logger) withRequestID(requestID string) *Logger {
	return &Logger{
		service:   l.service,
		env:       l.env,
		zlog:      l.zlog,
		requestID: requestID,
	}
}

func (l *Logger) decorate(event *zerolog.Event) *zerolog.Event {
	event = event.Str("service", l.service)
	if l.requestID != "" {
		event = event.Str("request_id", l.requestID)
	}
	return event
}

// Info returns an info-level log event.
func (l *Logger) Info() *zerolog.Event {
	return l.decorate(l.zlog.Info())
}

// Error returns an error-level log event.
func (l *Logger) Error() *zerolog.Event {
	return l.decorate(l.zlog.Error())
}

// Warn returns a warn-level log event.
func (l *Logger) Warn() *zerolog.Event {
	return l.decorate(l.zlog.Warn())
}

// Debug returns a debug-level log event.
func (l *Logger) Debug() *zerolog.Event {
	return l.decorate(l.zlog.Debug())
}

// WithRequestID injects a request ID into the context.
func WithRequestID(ctx context.Context, requestID string) context.Context {
	return context.WithValue(ctx, requestIDKey, requestID)
}

// RequestIDFromContext returns the request ID stored in context, if any.
func RequestIDFromContext(ctx context.Context) string {
	if requestID, ok := ctx.Value(requestIDKey).(string); ok {
		return requestID
	}
	return ""
}

// WithContext stores the logger in the context.
func WithContext(ctx context.Context, logger *Logger) context.Context {
	return context.WithValue(ctx, loggerKey, logger)
}

// FromContext returns the logger from context, enriched with request ID when present.
func FromContext(ctx context.Context) *Logger {
	l, ok := ctx.Value(loggerKey).(*Logger)
	if !ok {
		return New("unknown", "development", "info")
	}

	if requestID, ok := ctx.Value(requestIDKey).(string); ok && requestID != "" {
		return l.withRequestID(requestID)
	}

	return l
}

// Service returns the configured service name.
func (l *Logger) Service() string {
	return l.service
}

// Env returns the configured environment name.
func (l *Logger) Env() string {
	return l.env
}

// RequestID returns the request ID attached to this logger instance.
func (l *Logger) RequestID() string {
	return l.requestID
}

// Zerolog returns the underlying zerolog logger.
func (l *Logger) Zerolog() zerolog.Logger {
	return l.zlog
}
