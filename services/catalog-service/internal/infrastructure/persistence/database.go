package persistence

import (
	"context"
	"fmt"
	"time"

	"github.com/novacommerce/services/catalog-service/config"
	pkgdatabase "github.com/novacommerce/pkg/database"
	pkglogger "github.com/novacommerce/pkg/logger"
)

// NewDatabase creates a PostgreSQL connection pool via pkg/database.
func NewDatabase(ctx context.Context, cfg config.DatabaseConfig, log *pkglogger.Logger) (*pkgdatabase.DB, error) {
	dsn := cfg.BuildDSN()
	if dsn == "" {
		return nil, fmt.Errorf("database DSN is required")
	}

	maxOpen := cfg.MaxConns
	if maxOpen <= 0 {
		maxOpen = 25
	}
	maxIdle := cfg.MinConns
	if maxIdle <= 0 {
		maxIdle = 5
	}
	connMaxLifetime := cfg.ConnMaxLifetime
	if connMaxLifetime <= 0 {
		connMaxLifetime = 300 * time.Second
	}

	db, err := pkgdatabase.New(ctx, pkgdatabase.Config{
		DSN:             dsn,
		MaxOpenConns:    maxOpen,
		MaxIdleConns:    maxIdle,
		ConnMaxLifetime: connMaxLifetime,
	})
	if err != nil {
		return nil, fmt.Errorf("connect to PostgreSQL: %w", err)
	}

	log.Info().
		Int("max_conns", maxOpen).
		Int("min_conns", maxIdle).
		Msg("connected to PostgreSQL")

	return db, nil
}
