package database

import (
	"errors"
	"fmt"
	"log"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/pgx/v5"
	_ "github.com/golang-migrate/migrate/v4/source/file"
)

// MigrationConfig configures database migrations.
type MigrationConfig struct {
	MigrationsPath string
	DSN            string
}

type migrator interface {
	Up() error
	Steps(int) error
	Version() (uint, bool, error)
	Close() (source error, database error)
}

func newMigrator(cfg MigrationConfig) (migrator, error) {
	if cfg.MigrationsPath == "" {
		return nil, fmt.Errorf("migrations path is required")
	}
	if cfg.DSN == "" {
		return nil, fmt.Errorf("database DSN is required")
	}

	m, err := migrate.New(cfg.MigrationsPath, cfg.DSN)
	if err != nil {
		return nil, fmt.Errorf("create migrator: %w", err)
	}

	m.Log = migrationLogger{}
	return m, nil
}

type migrationLogger struct{}

func (migrationLogger) Printf(format string, v ...interface{}) {
	log.Printf("[migration] "+format, v...)
}

func (migrationLogger) Verbose() bool {
	return true
}

// RunMigrations applies all pending migrations.
func RunMigrations(cfg MigrationConfig) error {
	m, err := newMigrator(cfg)
	if err != nil {
		return err
	}
	return runMigrationsUp(m)
}

func runMigrationsUp(m migrator) error {
	defer closeMigrator(m)

	if err := m.Up(); err != nil && !errors.Is(err, migrate.ErrNoChange) {
		return fmt.Errorf("run migrations up: %w", err)
	}
	return nil
}

// RollbackMigration rolls back one migration step.
func RollbackMigration(cfg MigrationConfig) error {
	m, err := newMigrator(cfg)
	if err != nil {
		return err
	}
	return rollbackMigrationStep(m)
}

func rollbackMigrationStep(m migrator) error {
	defer closeMigrator(m)

	if err := m.Steps(-1); err != nil && !errors.Is(err, migrate.ErrNoChange) {
		return fmt.Errorf("rollback migration: %w", err)
	}
	return nil
}

// MigrationVersion returns the current migration version and dirty flag.
func MigrationVersion(cfg MigrationConfig) (uint, bool, error) {
	m, err := newMigrator(cfg)
	if err != nil {
		return 0, false, err
	}
	return migrationVersion(m)
}

func migrationVersion(m migrator) (uint, bool, error) {
	defer closeMigrator(m)

	version, dirty, err := m.Version()
	if err != nil {
		if errors.Is(err, migrate.ErrNilVersion) {
			return 0, false, nil
		}
		return 0, false, fmt.Errorf("get migration version: %w", err)
	}
	return version, dirty, nil
}

func closeMigrator(m migrator) {
	if m == nil {
		return
	}
	sourceErr, dbErr := m.Close()
	if sourceErr != nil {
		log.Printf("[migration] close source error: %v", sourceErr)
	}
	if dbErr != nil {
		log.Printf("[migration] close database error: %v", dbErr)
	}
}
