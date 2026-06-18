package persistence

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
	pkgkafka "github.com/novacommerce/pkg/kafka"
	"github.com/novacommerce/services/catalog-service/internal/application/port"
)

type pgxTransactor struct {
	pool *pgxpool.Pool
}

// NewTransactor creates a port.Transactor backed by pgxpool.
func NewTransactor(pool *pgxpool.Pool) port.Transactor {
	return &pgxTransactor{pool: pool}
}

func (t *pgxTransactor) WithTransaction(ctx context.Context, fn func(ctx context.Context) error) error {
	tx, err := t.pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("begin transaction: %w", err)
	}

	txCtx := pkgkafka.ContextWithTransaction(ctx, tx)

	if fnErr := fn(txCtx); fnErr != nil {
		if rbErr := tx.Rollback(ctx); rbErr != nil {
			return fmt.Errorf("rollback after %w: %v", fnErr, rbErr)
		}
		return fnErr
	}

	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("commit transaction: %w", err)
	}
	return nil
}
