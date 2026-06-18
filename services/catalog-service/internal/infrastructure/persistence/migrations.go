package persistence

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"

	pkgdatabase "github.com/novacommerce/pkg/database"
)

// RunMigrations applies catalog-service SQL migrations.
func RunMigrations(dsn string) error {
	root, err := findServiceRoot()
	if err != nil {
		return err
	}

	migrationsPath := filepath.ToSlash(filepath.Join(root, "migrations"))
	return pkgdatabase.RunMigrations(pkgdatabase.MigrationConfig{
		MigrationsPath: "file://" + migrationsPath,
		DSN:            toMigrateDSN(dsn),
	})
}

func toMigrateDSN(connStr string) string {
	if strings.HasPrefix(connStr, "postgres://") {
		return "pgx5://" + strings.TrimPrefix(connStr, "postgres://")
	}
	return connStr
}

func findServiceRoot() (string, error) {
	wd, err := os.Getwd()
	if err != nil {
		return "", fmt.Errorf("resolve working directory: %w", err)
	}

	dir := wd
	for {
		if _, err := os.Stat(filepath.Join(dir, "go.mod")); err == nil {
			if _, err := os.Stat(filepath.Join(dir, "migrations")); err == nil {
				return dir, nil
			}
		}
		parent := filepath.Dir(dir)
		if parent == dir {
			return "", fmt.Errorf("catalog-service root not found")
		}
		dir = parent
	}
}
