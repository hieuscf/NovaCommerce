package port

import "context"

// Transactor executes a function within a single DB transaction.
// Implementations embed an active transaction into the context so that
// repository calls inside fn use the same connection automatically.
// The transaction is committed when fn returns nil, and rolled back otherwise.
type Transactor interface {
	WithTransaction(ctx context.Context, fn func(ctx context.Context) error) error
}
