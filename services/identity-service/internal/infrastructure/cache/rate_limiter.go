package cache

import (
	"context"
	"fmt"
	"time"

	"github.com/novacommerce/identity-service/internal/application/port"
	apperrors "github.com/novacommerce/pkg/errors"
	"github.com/redis/go-redis/v9"
)

const useCaseRateLimitScript = `
local current = redis.call('INCR', KEYS[1])
if current == 1 then
  redis.call('PEXPIRE', KEYS[1], ARGV[1])
end
return current
`

// UseCaseRateLimiter implements port.RateLimiter for application-layer throttling.
type UseCaseRateLimiter struct {
	client *redis.Client
	limit  int
	window time.Duration
}

// NewUseCaseRateLimiter creates a Redis-backed rate limiter for use cases.
func NewUseCaseRateLimiter(client *redis.Client, limit int, window time.Duration) port.RateLimiter {
	return &UseCaseRateLimiter{
		client: client,
		limit:  limit,
		window: window,
	}
}

// Allow increments the counter for key and rejects when the limit is exceeded.
func (r *UseCaseRateLimiter) Allow(ctx context.Context, key string) error {
	if r.client == nil || r.limit <= 0 || r.window <= 0 {
		return nil
	}

	redisKey := fmt.Sprintf("rate:usecase:%s", key)
	count, err := r.client.Eval(ctx, useCaseRateLimitScript, []string{redisKey}, r.window.Milliseconds()).Int64()
	if err != nil {
		return fmt.Errorf("useCaseRateLimiter.Allow: %w", err)
	}
	if count > int64(r.limit) {
		return apperrors.NewTooManyRequests("too many requests")
	}
	return nil
}
