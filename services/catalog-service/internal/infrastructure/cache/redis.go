package cache

import (
	"context"
	"fmt"

	"github.com/novacommerce/services/catalog-service/config"
	pkgcache "github.com/novacommerce/pkg/cache"
	pkglogger "github.com/novacommerce/pkg/logger"
)

// NewRedisClient creates and verifies a Redis client via pkg/cache.
func NewRedisClient(ctx context.Context, cfg config.RedisConfig, log *pkglogger.Logger) (*pkgcache.Cache, error) {
	addr := cfg.BuildAddr()
	if addr == "" {
		return nil, fmt.Errorf("redis address is required")
	}

	poolSize := cfg.PoolSize
	if poolSize <= 0 {
		poolSize = 10
	}

	client, err := pkgcache.New(pkgcache.Config{
		Addr:     addr,
		Password: cfg.Password,
		DB:       cfg.DB,
		PoolSize: poolSize,
	})
	if err != nil {
		return nil, fmt.Errorf("create redis client: %w", err)
	}

	if err := client.Ping(ctx); err != nil {
		_ = client.Close()
		return nil, fmt.Errorf("ping redis: %w", err)
	}

	log.Info().Str("addr", addr).Msg("connected to Redis")

	return client, nil
}
