package persistence

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgerrcode"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
	pkglogger "github.com/novacommerce/pkg/logger"
	"github.com/novacommerce/services/catalog-service/internal/domain/entity"
)

const slowQueryThreshold = 100 * time.Millisecond

type querier interface {
	Query(ctx context.Context, sql string, args ...any) (pgx.Rows, error)
	QueryRow(ctx context.Context, sql string, args ...any) pgx.Row
	Exec(ctx context.Context, sql string, args ...any) (pgconn.CommandTag, error)
}

type queryLogger struct {
	q      querier
	logger *pkglogger.Logger
	table  string
}

func newQueryLogger(pool *pgxpool.Pool, logger *pkglogger.Logger, table string) queryLogger {
	return queryLogger{q: pool, logger: logger, table: table}
}

func (l queryLogger) Query(ctx context.Context, sql string, args ...any) (pgx.Rows, error) {
	start := time.Now()
	rows, err := l.q.Query(ctx, sql, args...)
	l.logSlow(sql, time.Since(start))
	return rows, err
}

func (l queryLogger) QueryRow(ctx context.Context, sql string, args ...any) pgx.Row {
	start := time.Now()
	row := l.q.QueryRow(ctx, sql, args...)
	l.logSlow(sql, time.Since(start))
	return row
}

func (l queryLogger) Exec(ctx context.Context, sql string, args ...any) (pgconn.CommandTag, error) {
	start := time.Now()
	tag, err := l.q.Exec(ctx, sql, args...)
	l.logSlow(sql, time.Since(start))
	return tag, err
}

func (l queryLogger) logSlow(query string, duration time.Duration) {
	if l.logger == nil || duration <= slowQueryThreshold {
		return
	}
	l.logger.Warn().
		Str("query", strings.TrimSpace(query)).
		Dur("duration", duration).
		Str("table", l.table).
		Msg("slow query")
}

func generateProductSlug(name string, id uuid.UUID) string {
	slug := strings.ToLower(strings.TrimSpace(name))
	slug = strings.ReplaceAll(slug, " ", "-")
	return fmt.Sprintf("%s-%s", slug, id.String()[:8])
}

func mapProductError(err error) error {
	if err == nil {
		return nil
	}
	if errors.Is(err, pgx.ErrNoRows) {
		return entity.ErrProductNotFound
	}
	if dup := mapUniqueViolation(err, "slug", entity.ErrDuplicateSKU); dup != nil {
		return dup
	}
	return fmt.Errorf("product repository: %w", err)
}

func mapVariantError(err error) error {
	if err == nil {
		return nil
	}
	if errors.Is(err, pgx.ErrNoRows) {
		return entity.ErrVariantNotFound
	}
	if dup := mapUniqueViolation(err, "sku", entity.ErrDuplicateSKU); dup != nil {
		return dup
	}
	return fmt.Errorf("product variant repository: %w", err)
}

func mapImageError(err error) error {
	if err == nil {
		return nil
	}
	if errors.Is(err, pgx.ErrNoRows) {
		return entity.ErrProductNotFound
	}
	return fmt.Errorf("product image repository: %w", err)
}

func mapUniqueViolation(err error, constraintFragment string, domainErr error) error {
	var pgErr *pgconn.PgError
	if !errors.As(err, &pgErr) || pgErr.Code != pgerrcode.UniqueViolation {
		return nil
	}
	if strings.Contains(pgErr.ConstraintName, constraintFragment) {
		return domainErr
	}
	return nil
}
