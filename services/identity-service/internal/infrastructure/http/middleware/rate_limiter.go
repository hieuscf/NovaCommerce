package middleware

import (
	"context"
	"fmt"
	"time"

	"github.com/gin-gonic/gin"
	apperrors "github.com/novacommerce/pkg/errors"
	"github.com/redis/go-redis/v9"
)

type rateLimitErrorEnvelope struct {
	Data  any `json:"data"`
	Meta  any `json:"meta"`
	Error any `json:"error"`
}

func writeRateLimitError(c *gin.Context, appErr *apperrors.AppError) {
	c.JSON(appErr.HTTPStatus, rateLimitErrorEnvelope{
		Data: nil,
		Meta: nil,
		Error: map[string]any{
			"code":    appErr.Code,
			"message": appErr.Message,
			"details": appErr.Details,
		},
	})
}

const rateLimitScript = `
local current = redis.call('INCR', KEYS[1])
if current == 1 then
  redis.call('PEXPIRE', KEYS[1], ARGV[1])
end
return current
`

// RateLimiterConfig configures Redis-backed sliding window rate limiting.
type RateLimiterConfig struct {
	Redis   *redis.Client
	Key     string
	Limit   int
	Window  time.Duration
	KeyFunc func(*gin.Context) string
}

// RateLimiter returns middleware that limits requests using Redis INCR + PEXPIRE.
func RateLimiter(cfg RateLimiterConfig) gin.HandlerFunc {
	return func(c *gin.Context) {
		if cfg.Redis == nil || cfg.KeyFunc == nil || cfg.Limit <= 0 || cfg.Window <= 0 {
			c.Next()
			return
		}

		redisKey := cfg.KeyFunc(c)
		count, err := incrementRateLimit(c.Request.Context(), cfg.Redis, redisKey, cfg.Window)
		if err != nil {
			writeRateLimitError(c, apperrors.NewInternal("rate limiter unavailable"))
			c.Abort()
			return
		}

		if count > int64(cfg.Limit) {
			retryAfter := retryAfterSeconds(c.Request.Context(), cfg.Redis, redisKey, cfg.Window)
			c.Header("Retry-After", fmt.Sprintf("%d", retryAfter))
			writeRateLimitError(c, apperrors.NewTooManyRequests("too many requests"))
			c.Abort()
			return
		}

		c.Next()
	}
}

// LoginRateLimiter limits login attempts to 5 per 15 minutes per IP.
func LoginRateLimiter(redisClient *redis.Client) gin.HandlerFunc {
	return RateLimiter(RateLimiterConfig{
		Redis:  redisClient,
		Key:    "login",
		Limit:  5,
		Window: 15 * time.Minute,
		KeyFunc: func(c *gin.Context) string {
			return fmt.Sprintf("rate:login:%s", c.ClientIP())
		},
	})
}

// RegisterRateLimiter limits registration attempts to 10 per hour per IP.
func RegisterRateLimiter(redisClient *redis.Client) gin.HandlerFunc {
	return RateLimiter(RateLimiterConfig{
		Redis:  redisClient,
		Key:    "register",
		Limit:  10,
		Window: time.Hour,
		KeyFunc: func(c *gin.Context) string {
			return fmt.Sprintf("rate:register:%s", c.ClientIP())
		},
	})
}

func incrementRateLimit(ctx context.Context, client *redis.Client, key string, window time.Duration) (int64, error) {
	result, err := client.Eval(ctx, rateLimitScript, []string{key}, window.Milliseconds()).Int64()
	if err != nil {
		return 0, err
	}
	return result, nil
}

func retryAfterSeconds(ctx context.Context, client *redis.Client, key string, window time.Duration) int64 {
	ttl, err := client.PTTL(ctx, key).Result()
	if err != nil || ttl <= 0 {
		return int64(window.Seconds())
	}
	seconds := int64((ttl + time.Second - 1) / time.Second)
	if seconds < 1 {
		return 1
	}
	return seconds
}
