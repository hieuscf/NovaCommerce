package postgres

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/novacommerce/identity-service/internal/application/port"
)

type pgxTransactor struct {
	pool *pgxpool.Pool
}

// NewTransactor creates a port.Transactor backed by a pgxpool.Pool.
func NewTransactor(pool *pgxpool.Pool) port.Transactor {
	return &pgxTransactor{pool: pool}
}

// WithTransaction begins a transaction, runs fn with a context that carries the
// active pgx.Tx, then commits on success or rolls back on any error.
func (t *pgxTransactor) WithTransaction(ctx context.Context, fn func(ctx context.Context) error) error {
	tx, err := t.pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("pgxTransactor.WithTransaction: begin: %w", err)
	}

	txCtx := withTxContext(ctx, tx)

	if fnErr := fn(txCtx); fnErr != nil {
		if rbErr := tx.Rollback(ctx); rbErr != nil {
			return fmt.Errorf("pgxTransactor.WithTransaction: rollback after %w: rollback: %v", fnErr, rbErr)
		}
		return fnErr
	}

	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("pgxTransactor.WithTransaction: commit: %w", err)
	}
	return nil
}
