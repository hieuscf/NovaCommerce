package middleware

import (
	"crypto/rsa"
	"crypto/x509"
	"encoding/pem"
	"fmt"
	"net/http"
	"runtime/debug"
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	apperrors "github.com/novacommerce/pkg/errors"
	pkglogger "github.com/novacommerce/pkg/logger"
	"github.com/novacommerce/pkg/response"
	"golang.org/x/time/rate"
)

const (
	ContextKeyRequestID = "request_id"
	ContextKeyUserID    = "user_id"
	ContextKeyUserRole  = "user_role"
	ContextKeyClaims    = "claims"
)

// Claims represents JWT claims used across NovaCommerce services.
type Claims struct {
	UserID string `json:"user_id"`
	Role   string `json:"role"`
	Email  string `json:"email"`
	jwt.RegisteredClaims
}

// JWTConfig configures JWT authentication middleware.
type JWTConfig struct {
	PublicKeyPEM []byte
	Issuer       string
	TokenLookup  string
}

type limiterEntry struct {
	limiter  *rate.Limiter
	lastSeen time.Time
}

var rateLimitStore sync.Map

func init() {
	go rateLimitCleanup()
}

func rateLimitCleanup() {
	ticker := time.NewTicker(time.Minute)
	defer ticker.Stop()

	for range ticker.C {
		now := time.Now()
		rateLimitStore.Range(func(key, value any) bool {
			entry, ok := value.(*limiterEntry)
			if !ok {
				rateLimitStore.Delete(key)
				return true
			}
			if now.Sub(entry.lastSeen) > 5*time.Minute {
				rateLimitStore.Delete(key)
			}
			return true
		})
	}
}

// RequestID ensures every request has a unique request ID.
func RequestID() gin.HandlerFunc {
	return func(c *gin.Context) {
		requestID := c.GetHeader("X-Request-ID")
		if requestID == "" {
			requestID = uuid.NewString()
		}

		c.Set(ContextKeyRequestID, requestID)
		c.Header("X-Request-ID", requestID)
		c.Request = c.Request.WithContext(pkglogger.WithRequestID(c.Request.Context(), requestID))
		c.Next()
	}
}

// Logger logs HTTP requests with latency and status metadata.
func Logger(log *pkglogger.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		if shouldSkipRequestLog(c.Request.URL.Path) {
			c.Next()
			return
		}

		start := time.Now()
		c.Next()

		latency := time.Since(start)
		status := c.Writer.Status()
		requestID, _ := c.Get(ContextKeyRequestID)

		event := log.Info().
			Str("method", c.Request.Method).
			Str("path", c.Request.URL.Path).
			Int("status", status).
			Dur("latency", latency).
			Str("client_ip", c.ClientIP())

		if requestID != nil {
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

// Recovery recovers from panics and returns a standardized internal error response.
func Recovery(log *pkglogger.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if recovered := recover(); recovered != nil {
				stack := string(debug.Stack())
				requestID, _ := c.Get(ContextKeyRequestID)

				event := log.Error().
					Interface("panic", recovered).
					Str("stack", stack).
					Str("path", c.Request.URL.Path)

				if requestID != nil {
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

// JWT validates bearer tokens and stores claims in the Gin context.
func JWT(cfg JWTConfig) gin.HandlerFunc {
	publicKey, err := parseRSAPublicKey(cfg.PublicKeyPEM)
	if err != nil {
		panic(fmt.Sprintf("middleware.JWT: invalid public key: %v", err))
	}

	tokenLookup := cfg.TokenLookup
	if tokenLookup == "" {
		tokenLookup = "header:Authorization"
	}

	return func(c *gin.Context) {
		tokenString, err := extractToken(c, tokenLookup)
		if err != nil {
			response.Error(c.Writer, apperrors.NewUnauthorized("Missing or invalid authorization token"))
			c.Abort()
			return
		}

		claims := &Claims{}
		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			if token.Method.Alg() != jwt.SigningMethodRS256.Alg() {
				return nil, fmt.Errorf("unexpected signing method: %s", token.Method.Alg())
			}
			return publicKey, nil
		}, jwt.WithIssuer(cfg.Issuer))
		if err != nil || !token.Valid {
			response.Error(c.Writer, apperrors.NewUnauthorized("Invalid or expired token"))
			c.Abort()
			return
		}

		c.Set(ContextKeyUserID, claims.UserID)
		c.Set(ContextKeyUserRole, claims.Role)
		c.Set(ContextKeyClaims, claims)
		c.Next()
	}
}

func parseRSAPublicKey(pemBytes []byte) (*rsa.PublicKey, error) {
	block, _ := pem.Decode(pemBytes)
	if block == nil {
		return nil, fmt.Errorf("failed to decode PEM block")
	}

	switch block.Type {
	case "PUBLIC KEY":
		key, err := x509.ParsePKIXPublicKey(block.Bytes)
		if err != nil {
			return nil, err
		}
		publicKey, ok := key.(*rsa.PublicKey)
		if !ok {
			return nil, fmt.Errorf("not an RSA public key")
		}
		return publicKey, nil
	case "RSA PUBLIC KEY":
		return x509.ParsePKCS1PublicKey(block.Bytes)
	default:
		return nil, fmt.Errorf("unsupported key type %s", block.Type)
	}
}

func extractToken(c *gin.Context, tokenLookup string) (string, error) {
	parts := strings.SplitN(tokenLookup, ":", 2)
	if len(parts) != 2 || !strings.EqualFold(parts[0], "header") {
		return "", fmt.Errorf("unsupported token lookup: %s", tokenLookup)
	}

	headerValue := c.GetHeader(parts[1])
	if headerValue == "" {
		return "", fmt.Errorf("authorization header missing")
	}

	const bearerPrefix = "Bearer "
	if !strings.HasPrefix(headerValue, bearerPrefix) {
		return "", fmt.Errorf("invalid authorization header format")
	}

	return strings.TrimSpace(strings.TrimPrefix(headerValue, bearerPrefix)), nil
}

// GetUserID returns the authenticated user ID from context.
func GetUserID(c *gin.Context) (string, bool) {
	value, ok := c.Get(ContextKeyUserID)
	if !ok {
		return "", false
	}
	userID, ok := value.(string)
	return userID, ok && userID != ""
}

// GetUserRole returns the authenticated user role from context.
func GetUserRole(c *gin.Context) (string, bool) {
	value, ok := c.Get(ContextKeyUserRole)
	if !ok {
		return "", false
	}
	role, ok := value.(string)
	return role, ok && role != ""
}

// GetClaims returns parsed JWT claims from context.
func GetClaims(c *gin.Context) (*Claims, bool) {
	value, ok := c.Get(ContextKeyClaims)
	if !ok {
		return nil, false
	}
	claims, ok := value.(*Claims)
	return claims, ok && claims != nil
}

// CORSConfig configures CORS response headers.
type CORSConfig struct {
	AllowOrigins []string
	AllowMethods []string
	AllowHeaders []string
	MaxAge       time.Duration
}

// CORS applies configurable CORS headers.
func CORS(cfg CORSConfig) gin.HandlerFunc {
	allowOrigins := strings.Join(cfg.AllowOrigins, ", ")
	allowMethods := strings.Join(cfg.AllowMethods, ", ")
	allowHeaders := strings.Join(cfg.AllowHeaders, ", ")
	maxAge := int(cfg.MaxAge.Seconds())

	return func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", allowOrigins)
		c.Header("Access-Control-Allow-Methods", allowMethods)
		c.Header("Access-Control-Allow-Headers", allowHeaders)
		if maxAge > 0 {
			c.Header("Access-Control-Max-Age", fmt.Sprintf("%d", maxAge))
		}

		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}

// DefaultCORS returns a development-friendly CORS preset.
func DefaultCORS() gin.HandlerFunc {
	return CORS(CORSConfig{
		AllowOrigins: []string{"*"},
		AllowMethods: []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders: []string{"Authorization", "Content-Type", "X-Request-ID"},
		MaxAge:       12 * time.Hour,
	})
}

// RateLimitConfig configures token-bucket rate limiting.
type RateLimitConfig struct {
	RequestsPerMinute int
	BurstSize         int
	KeyFunc           func(c *gin.Context) string
}

// RateLimit limits requests per key using a token bucket.
func RateLimit(cfg RateLimitConfig) gin.HandlerFunc {
	if cfg.RequestsPerMinute <= 0 {
		cfg.RequestsPerMinute = 60
	}
	if cfg.BurstSize <= 0 {
		cfg.BurstSize = cfg.RequestsPerMinute
	}
	if cfg.KeyFunc == nil {
		cfg.KeyFunc = func(c *gin.Context) string {
			return c.ClientIP()
		}
	}

	limit := rate.Limit(float64(cfg.RequestsPerMinute) / 60.0)

	return func(c *gin.Context) {
		key := cfg.KeyFunc(c)
		entry := getOrCreateLimiter(key, limit, cfg.BurstSize)
		entry.lastSeen = time.Now()

		if !entry.limiter.Allow() {
			response.Error(c.Writer, apperrors.NewTooManyRequests("Rate limit exceeded"))
			c.Abort()
			return
		}

		c.Next()
	}
}

func getOrCreateLimiter(key string, limit rate.Limit, burst int) *limiterEntry {
	if value, ok := rateLimitStore.Load(key); ok {
		if entry, ok := value.(*limiterEntry); ok {
			return entry
		}
	}

	entry := &limiterEntry{
		limiter:  rate.NewLimiter(limit, burst),
		lastSeen: time.Now(),
	}
	actual, _ := rateLimitStore.LoadOrStore(key, entry)
	return actual.(*limiterEntry)
}

// RequireRole ensures the authenticated user has one of the required roles.
func RequireRole(roles ...string) gin.HandlerFunc {
	allowed := make(map[string]struct{}, len(roles))
	for _, role := range roles {
		allowed[role] = struct{}{}
	}

	return func(c *gin.Context) {
		role, ok := GetUserRole(c)
		if !ok {
			response.Error(c.Writer, apperrors.NewForbidden("Insufficient permissions"))
			c.Abort()
			return
		}

		if _, found := allowed[role]; !found {
			response.Error(c.Writer, apperrors.NewForbidden("Insufficient permissions"))
			c.Abort()
			return
		}

		c.Next()
	}
}
