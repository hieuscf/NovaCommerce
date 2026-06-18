package persistence

import (
	"context"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
	pkgkafka "github.com/novacommerce/pkg/kafka"
)

type dbQuerier interface {
	Query(ctx context.Context, sql string, args ...any) (pgx.Rows, error)
	QueryRow(ctx context.Context, sql string, args ...any) pgx.Row
	Exec(ctx context.Context, sql string, args ...any) (pgconn.CommandTag, error)
}

func extractQuerier(ctx context.Context, pool *pgxpool.Pool) dbQuerier {
	if tx, ok := pkgkafka.TransactionFromContext(ctx); ok {
		return tx
	}
	return pool
}
