package cache

import (
	"context"
	"fmt"

	"github.com/novacommerce/identity-service/config"
	pkglogger "github.com/novacommerce/pkg/logger"
	"github.com/redis/go-redis/v9"
)

// NewRedisClient creates and verifies a Redis client.
func NewRedisClient(ctx context.Context, cfg config.RedisConfig, log *pkglogger.Logger) (*redis.Client, error) {
	addr := cfg.BuildAddr()
	if addr == "" {
		return nil, fmt.Errorf("redis address is required")
	}

	poolSize := cfg.PoolSize
	if poolSize <= 0 {
		poolSize = 10
	}

	client := redis.NewClient(&redis.Options{
		Addr:     addr,
		Password: cfg.Password,
		DB:       cfg.DB,
		PoolSize: poolSize,
	})

	if err := client.Ping(ctx).Err(); err != nil {
		if closeErr := client.Close(); closeErr != nil {
			return nil, fmt.Errorf("ping redis: %w; close redis: %v", err, closeErr)
		}
		return nil, fmt.Errorf("ping redis: %w", err)
	}

	log.Info().Str("addr", addr).Msg("connected to Redis")

	return client, nil
}
