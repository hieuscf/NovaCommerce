package postgres

import (
	"context"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
)

// txContextKey is the unexported key used to store a pgx.Tx in a context.
type txContextKey struct{}

// dbQuerier is the minimal interface satisfied by both *pgxpool.Pool and pgx.Tx,
// allowing repository methods to be transaction-aware without importing pgconn
// throughout the codebase.
type dbQuerier interface {
	QueryRow(ctx context.Context, sql string, args ...any) pgx.Row
	Query(ctx context.Context, sql string, args ...any) (pgx.Rows, error)
	Exec(ctx context.Context, sql string, args ...any) (pgconn.CommandTag, error)
}

// withTxContext returns a context that carries the given transaction.
// Repository methods call extractQuerier to honour the transaction transparently.
func withTxContext(ctx context.Context, tx pgx.Tx) context.Context {
	return context.WithValue(ctx, txContextKey{}, tx)
}

// extractQuerier returns the pgx.Tx embedded in ctx when present, otherwise
// falls back to pool. This enables all repository operations inside a
// Transactor.WithTransaction call to run on the same connection.
func extractQuerier(ctx context.Context, pool *pgxpool.Pool) dbQuerier {
	if tx, ok := ctx.Value(txContextKey{}).(pgx.Tx); ok {
		return tx
	}
	return pool
}
