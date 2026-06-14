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
	if cfg.Addr == "" {
		return nil, fmt.Errorf("redis address is required")
	}

	client := redis.NewClient(&redis.Options{
		Addr:     cfg.Addr,
		Password: cfg.Password,
		DB:       cfg.DB,
	})

	if err := client.Ping(ctx).Err(); err != nil {
		client.Close()
		return nil, fmt.Errorf("ping redis: %w", err)
	}

	log.Info().Str("addr", cfg.Addr).Msg("connected to Redis")

	return client, nil
}
