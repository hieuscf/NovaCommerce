package port

import "context"

// RateLimiter gates sensitive operations such as login and password reset.
type RateLimiter interface {
	Allow(ctx context.Context, key string) error
}
