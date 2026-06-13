package database

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
)

type mockTx struct {
	committed   bool
	rolledBack  bool
	commitErr   error
	rollbackErr error
}

func (m *mockTx) Begin(_ context.Context) (pgx.Tx, error) { return m, nil }
func (m *mockTx) Commit(_ context.Context) error {
	if m.commitErr != nil {
		return m.commitErr
	}
	m.committed = true
	return nil
}
func (m *mockTx) Rollback(_ context.Context) error {
	if m.rollbackErr != nil {
		return m.rollbackErr
	}
	m.rolledBack = true
	return nil
}
func (m *mockTx) CopyFrom(context.Context, pgx.Identifier, []string, pgx.CopyFromSource) (int64, error) {
	return 0, nil
}
func (m *mockTx) SendBatch(context.Context, *pgx.Batch) pgx.BatchResults { return nil }
func (m *mockTx) LargeObjects() pgx.LargeObjects                         { return pgx.LargeObjects{} }
func (m *mockTx) Prepare(context.Context, string, string) (*pgconn.StatementDescription, error) {
	return nil, nil
}
func (m *mockTx) Exec(context.Context, string, ...any) (pgconn.CommandTag, error) {
	return pgconn.CommandTag{}, nil
}
func (m *mockTx) Query(context.Context, string, ...any) (pgx.Rows, error) { return nil, nil }
func (m *mockTx) QueryRow(context.Context, string, ...any) pgx.Row        { return nil }
func (m *mockTx) Conn() *pgx.Conn                                         { return nil }

type mockPool struct {
	tx          *mockTx
	commitErr   error
	rollbackErr error
}

func (p *mockPool) Begin(_ context.Context) (pgx.Tx, error) {
	p.tx = &mockTx{commitErr: p.commitErr, rollbackErr: p.rollbackErr}
	return p.tx, nil
}

func TestApplyConfigDefaults(t *testing.T) {
	cfg := Config{}
	applyConfigDefaults(&cfg)

	if cfg.MaxOpenConns != defaultMaxOpenConns {
		t.Fatalf("expected MaxOpenConns %d, got %d", defaultMaxOpenConns, cfg.MaxOpenConns)
	}
	if cfg.MaxIdleConns != defaultMaxIdleConns {
		t.Fatalf("expected MaxIdleConns %d, got %d", defaultMaxIdleConns, cfg.MaxIdleConns)
	}
	if cfg.ConnMaxLifetime != defaultConnMaxLifetime {
		t.Fatalf("expected ConnMaxLifetime %v, got %v", defaultConnMaxLifetime, cfg.ConnMaxLifetime)
	}
	if cfg.ConnMaxIdleTime != defaultConnMaxIdleTime {
		t.Fatalf("expected ConnMaxIdleTime %v, got %v", defaultConnMaxIdleTime, cfg.ConnMaxIdleTime)
	}
}

func TestWithTxCommitsOnSuccess(t *testing.T) {
	pool := &mockPool{}
	err := withTx(context.Background(), pool, func(tx pgx.Tx) error {
		return nil
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !pool.tx.committed {
		t.Fatal("expected transaction commit")
	}
	if pool.tx.rolledBack {
		t.Fatal("did not expect rollback")
	}
}

func TestWithTxRollsBackOnError(t *testing.T) {
	pool := &mockPool{}
	expected := errors.New("boom")
	err := withTx(context.Background(), pool, func(pgx.Tx) error {
		return expected
	})
	if !errors.Is(err, expected) {
		t.Fatalf("expected original error, got %v", err)
	}
	if pool.tx.rolledBack != true {
		t.Fatal("expected rollback on error")
	}
	if pool.tx.committed {
		t.Fatal("did not expect commit")
	}
}

func TestWithTxRollsBackOnPanic(t *testing.T) {
	pool := &mockPool{}
	defer func() {
		if recovered := recover(); recovered == nil {
			t.Fatal("expected panic to propagate")
		}
		if !pool.tx.rolledBack {
			t.Fatal("expected rollback on panic")
		}
	}()

	_ = withTx(context.Background(), pool, func(pgx.Tx) error {
		panic("panic")
	})
}

func TestNewRequiresDSN(t *testing.T) {
	if _, err := New(context.Background(), Config{}); err == nil {
		t.Fatal("expected error for empty DSN")
	}
}

func TestDBPingWithoutPool(t *testing.T) {
	db := &DB{}
	if err := db.Ping(context.Background()); err == nil {
		t.Fatal("expected error when pool is nil")
	}
}

func TestWithTxWithoutPool(t *testing.T) {
	db := &DB{}
	if err := db.WithTx(context.Background(), func(pgx.Tx) error { return nil }); err == nil {
		t.Fatal("expected error when pool is nil")
	}
}

func TestMigrationConfigValidation(t *testing.T) {
	if _, err := newMigrator(MigrationConfig{}); err == nil {
		t.Fatal("expected migration config validation error")
	}
	if _, err := newMigrator(MigrationConfig{MigrationsPath: "file://migrations"}); err == nil {
		t.Fatal("expected DSN validation error")
	}
}

func TestApplyConfigDefaultsPreservesCustomValues(t *testing.T) {
	cfg := Config{
		MaxOpenConns:    50,
		MaxIdleConns:    10,
		ConnMaxLifetime: time.Hour,
		ConnMaxIdleTime: 30 * time.Minute,
	}
	applyConfigDefaults(&cfg)

	if cfg.MaxOpenConns != 50 || cfg.MaxIdleConns != 10 {
		t.Fatal("expected custom pool values to be preserved")
	}
}

func TestWithTxCommitFailure(t *testing.T) {
	pool := &mockPool{commitErr: errors.New("commit failed")}

	err := withTx(context.Background(), pool, func(pgx.Tx) error {
		return nil
	})
	if err == nil {
		t.Fatal("expected commit failure")
	}
}

func TestDBWithTxUsesPool(t *testing.T) {
	pool := &mockPool{}
	db := &DB{pool: pool}

	err := db.WithTx(context.Background(), func(pgx.Tx) error { return nil })
	if err != nil {
		t.Fatalf("unexpected withTx error: %v", err)
	}
	if !pool.tx.committed {
		t.Fatal("expected transaction commit through DB.WithTx")
	}
}

func TestNewInvalidDSN(t *testing.T) {
	if _, err := New(context.Background(), Config{DSN: "://invalid"}); err == nil {
		t.Fatal("expected error for invalid DSN")
	}
}

func TestRunMigrationsInvalidConfig(t *testing.T) {
	if err := RunMigrations(MigrationConfig{
		MigrationsPath: "file://missing",
		DSN:            "postgres://user:pass@localhost:5432/db?sslmode=disable",
	}); err == nil {
		t.Fatal("expected migration error")
	}
}

func TestRollbackMigrationInvalidConfig(t *testing.T) {
	if err := RollbackMigration(MigrationConfig{
		MigrationsPath: "file://missing",
		DSN:            "postgres://user:pass@localhost:5432/db?sslmode=disable",
	}); err == nil {
		t.Fatal("expected rollback error")
	}
}

func TestMigrationVersionInvalidConfig(t *testing.T) {
	if _, _, err := MigrationVersion(MigrationConfig{
		MigrationsPath: "file://missing",
		DSN:            "postgres://user:pass@localhost:5432/db?sslmode=disable",
	}); err == nil {
		t.Fatal("expected migration version error")
	}
}

func TestDBCloseNilPool(t *testing.T) {
	db := &DB{}
	db.Close()
}

func TestNewPingFailure(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	_, err := New(ctx, Config{DSN: "postgres://user:pass@127.0.0.1:1/db?connect_timeout=1"})
	if err == nil {
		t.Fatal("expected connection error")
	}
}

func TestWithTxRollbackFailure(t *testing.T) {
	pool := &mockPool{rollbackErr: errors.New("rollback failed")}

	err := withTx(context.Background(), pool, func(pgx.Tx) error {
		return errors.New("tx failed")
	})
	if err == nil {
		t.Fatal("expected rollback wrapped error")
	}
}
