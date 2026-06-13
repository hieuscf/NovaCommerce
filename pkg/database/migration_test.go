package database

import (
	"errors"
	"testing"

	"github.com/golang-migrate/migrate/v4"
)

type mockMigrator struct {
	upErr       error
	stepsErr    error
	version     uint
	dirty       bool
	versionErr  error
	closeSource error
	closeDB     error
}

func (m *mockMigrator) Up() error       { return m.upErr }
func (m *mockMigrator) Steps(int) error { return m.stepsErr }
func (m *mockMigrator) Version() (uint, bool, error) {
	if m.versionErr != nil {
		return 0, false, m.versionErr
	}
	return m.version, m.dirty, nil
}
func (m *mockMigrator) Close() (error, error) { return m.closeSource, m.closeDB }

func TestRunMigrationsUpSuccess(t *testing.T) {
	if err := runMigrationsUp(&mockMigrator{}); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
}

func TestRunMigrationsUpNoChange(t *testing.T) {
	if err := runMigrationsUp(&mockMigrator{upErr: migrate.ErrNoChange}); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
}

func TestRunMigrationsUpFailure(t *testing.T) {
	if err := runMigrationsUp(&mockMigrator{upErr: errors.New("up failed")}); err == nil {
		t.Fatal("expected up failure")
	}
}

func TestRollbackMigrationSuccess(t *testing.T) {
	if err := rollbackMigrationStep(&mockMigrator{}); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
}

func TestRollbackMigrationNoChange(t *testing.T) {
	if err := rollbackMigrationStep(&mockMigrator{stepsErr: migrate.ErrNoChange}); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
}

func TestMigrationVersionSuccess(t *testing.T) {
	version, dirty, err := migrationVersion(&mockMigrator{version: 3, dirty: true})
	if err != nil || version != 3 || !dirty {
		t.Fatalf("unexpected version result: %d dirty=%v err=%v", version, dirty, err)
	}
}

func TestMigrationVersionNil(t *testing.T) {
	version, dirty, err := migrationVersion(&mockMigrator{versionErr: migrate.ErrNilVersion})
	if err != nil || version != 0 || dirty {
		t.Fatalf("unexpected nil version result: %d dirty=%v err=%v", version, dirty, err)
	}
}

func TestMigrationVersionFailure(t *testing.T) {
	if _, _, err := migrationVersion(&mockMigrator{versionErr: errors.New("version failed")}); err == nil {
		t.Fatal("expected version failure")
	}
}

func TestCloseMigratorLogsErrors(t *testing.T) {
	closeMigrator(&mockMigrator{
		closeSource: errors.New("source close failed"),
		closeDB:     errors.New("db close failed"),
	})
}

func TestMigrationLogger(t *testing.T) {
	logger := migrationLogger{}
	if !logger.Verbose() {
		t.Fatal("expected verbose logger")
	}
	logger.Printf("applied migration %d", 1)
}

func TestCloseMigratorNilSafe(t *testing.T) {
	closeMigrator(nil)
}
