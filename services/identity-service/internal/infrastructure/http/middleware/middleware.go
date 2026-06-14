package middleware

import (
	"net/http"
	"runtime/debug"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	apperrors "github.com/novacommerce/pkg/errors"
	pkglogger "github.com/novacommerce/pkg/logger"
	"github.com/novacommerce/pkg/response"
)

const contextKeyRequestID = "request_id"

var (
	appLogger   *pkglogger.Logger
	corsOrigins []string
)

// Init configures middleware dependencies from application config.
func Init(log *pkglogger.Logger, allowOrigins []string) {
	appLogger = log
	corsOrigins = allowOrigins
}

// RequestID generates or propagates a UUID v4 request ID.
func RequestID() gin.HandlerFunc {
	return func(c *gin.Context) {
		requestID := c.GetHeader("X-Request-ID")
		if requestID == "" {
			requestID = uuid.NewString()
		}

		c.Set(contextKeyRequestID, requestID)
		c.Header("X-Request-ID", requestID)
		c.Request = c.Request.WithContext(pkglogger.WithRequestID(c.Request.Context(), requestID))
		c.Next()
	}
}

// InjectLogger stores the application logger in the request context.
func InjectLogger() gin.HandlerFunc {
	return func(c *gin.Context) {
		if appLogger != nil {
			c.Request = c.Request.WithContext(pkglogger.WithContext(c.Request.Context(), appLogger))
		}
		c.Next()
	}
}

// Logger logs HTTP request metadata after the handler completes.
func Logger() gin.HandlerFunc {
	return func(c *gin.Context) {
		if shouldSkipRequestLog(c.Request.URL.Path) {
			c.Next()
			return
		}

		start := time.Now().UTC()
		c.Next()

		latency := time.Since(start)
		status := c.Writer.Status()
		log := loggerFromContext(c)

		event := log.Info().
			Str("method", c.Request.Method).
			Str("path", c.Request.URL.Path).
			Int("status", status).
			Dur("latency", latency).
			Str("client_ip", c.ClientIP())

		if requestID, ok := c.Get(contextKeyRequestID); ok {
			if id, ok := requestID.(string); ok && id != "" {
				event = event.Str("request_id", id)
			}
		}

		switch {
		case status >= http.StatusInternalServerError:
			log.Error().
				Str("method", c.Request.Method).
				Str("path", c.Request.URL.Path).
				Int("status", status).
				Dur("latency", latency).
				Str("client_ip", c.ClientIP()).
				Msg("request completed")
		case status >= http.StatusBadRequest:
			log.Warn().
				Str("method", c.Request.Method).
				Str("path", c.Request.URL.Path).
				Int("status", status).
				Dur("latency", latency).
				Str("client_ip", c.ClientIP()).
				Msg("request completed")
		default:
			event.Msg("request completed")
		}
	}
}

func shouldSkipRequestLog(path string) bool {
	return path == "/health" || path == "/metrics"
}

func loggerFromContext(c *gin.Context) *pkglogger.Logger {
	if log := pkglogger.FromContext(c.Request.Context()); log != nil {
		return log
	}
	if appLogger != nil {
		return appLogger
	}
	return pkglogger.New("identity-service", "development", "info")
}

// Recovery recovers from panics and returns a standardized 500 response.
func Recovery() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if recovered := recover(); recovered != nil {
				stack := string(debug.Stack())
				log := loggerFromContext(c)

				event := log.Error().
					Interface("panic", recovered).
					Str("stack", stack).
					Str("path", c.Request.URL.Path)

				if requestID, ok := c.Get(contextKeyRequestID); ok {
					if id, ok := requestID.(string); ok {
						event = event.Str("request_id", id)
					}
				}

				event.Msg("panic recovered")
				response.Error(c.Writer, apperrors.NewInternal("Internal server error"))
				c.Abort()
			}
		}()

		c.Next()
	}
}

// CORS applies configurable cross-origin response headers.
func CORS() gin.HandlerFunc {
	origins := "*"
	if len(corsOrigins) > 0 {
		origins = joinOrigins(corsOrigins)
	}

	return func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", origins)
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Authorization, Content-Type, X-Request-ID")
		c.Header("Access-Control-Max-Age", "43200")

		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}

func joinOrigins(origins []string) string {
	if len(origins) == 1 {
		return origins[0]
	}
	result := origins[0]
	for i := 1; i < len(origins); i++ {
		result += ", " + origins[i]
	}
	return result
}
