//go:build integration

package persistence_test

import (
	"context"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/novacommerce/pkg/database"
	"github.com/stretchr/testify/require"
	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/modules/postgres"
	"github.com/testcontainers/testcontainers-go/wait"
)

func startPostgresContainer(t *testing.T, ctx context.Context) (testcontainers.Container, string) {
	t.Helper()

	container, err := postgres.Run(ctx,
		"postgres:16-alpine",
		postgres.WithDatabase("catalog_test"),
		postgres.WithUsername("test"),
		postgres.WithPassword("test"),
		testcontainers.WithWaitStrategy(
			wait.ForLog("database system is ready to accept connections").
				WithOccurrence(2).
				WithStartupTimeout(60*time.Second),
		),
	)
	require.NoError(t, err)

	connStr, err := container.ConnectionString(ctx, "sslmode=disable")
	require.NoError(t, err)

	return container, connStr
}

func runMigrations(t *testing.T, connStr string) {
	t.Helper()

	serviceRoot := findServiceRoot(t)
	migrationsPath := filepath.ToSlash(filepath.Join(serviceRoot, "migrations"))

	err := database.RunMigrations(database.MigrationConfig{
		MigrationsPath: "file://" + migrationsPath,
		DSN:            toMigrateDSN(connStr),
	})
	require.NoError(t, err)
}

func initPool(t *testing.T, ctx context.Context, connStr string) *pgxpool.Pool {
	t.Helper()

	pool, err := pgxpool.New(ctx, connStr)
	require.NoError(t, err)
	require.NoError(t, pool.Ping(ctx))
	return pool
}

func findServiceRoot(t *testing.T) string {
	t.Helper()

	wd, err := os.Getwd()
	require.NoError(t, err)

	dir := wd
	for {
		if _, err := os.Stat(filepath.Join(dir, "go.mod")); err == nil {
			if _, err := os.Stat(filepath.Join(dir, "migrations")); err == nil {
				return dir
			}
		}
		parent := filepath.Dir(dir)
		if parent == dir {
			t.Fatal("could not find catalog-service root")
		}
		dir = parent
	}
}

func toMigrateDSN(connStr string) string {
	if strings.HasPrefix(connStr, "postgres://") {
		return "pgx5://" + strings.TrimPrefix(connStr, "postgres://")
	}
	return connStr
}
