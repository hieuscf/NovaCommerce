package postgres

import (
	"context"
	"fmt"
	"time"

	"github.com/exaring/otelpgx"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/novacommerce/identity-service/config"
	pkglogger "github.com/novacommerce/pkg/logger"
)

// NewPool creates a PostgreSQL connection pool with OpenTelemetry tracing.
func NewPool(ctx context.Context, cfg config.DatabaseConfig, log *pkglogger.Logger) (*pgxpool.Pool, error) {
	if cfg.DSN == "" {
		return nil, fmt.Errorf("database DSN is required")
	}

	maxOpen := cfg.MaxOpenConns
	if maxOpen <= 0 {
		maxOpen = 25
	}
	maxIdle := cfg.MaxIdleConns
	if maxIdle <= 0 {
		maxIdle = 5
	}
	connMaxLifetime := time.Duration(cfg.ConnMaxLifetime) * time.Second
	if connMaxLifetime <= 0 {
		connMaxLifetime = 300 * time.Second
	}

	poolConfig, err := pgxpool.ParseConfig(cfg.DSN)
	if err != nil {
		return nil, fmt.Errorf("parse database config: %w", err)
	}

	poolConfig.MaxConns = int32(maxOpen)
	poolConfig.MinConns = int32(maxIdle)
	poolConfig.MaxConnLifetime = connMaxLifetime
	poolConfig.ConnConfig.Tracer = otelpgx.NewTracer()

	pool, err := pgxpool.NewWithConfig(ctx, poolConfig)
	if err != nil {
		return nil, fmt.Errorf("create database pool: %w", err)
	}

	if err := pool.Ping(ctx); err != nil {
		pool.Close()
		return nil, fmt.Errorf("ping database: %w", err)
	}

	log.Info().
		Int("max_conns", maxOpen).
		Int("min_conns", maxIdle).
		Msg("connected to PostgreSQL")

	return pool, nil
}
