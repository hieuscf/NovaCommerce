package port

import "context"

// Transactor runs fn inside a single database transaction.
type Transactor interface {
	WithTransaction(ctx context.Context, fn func(ctx context.Context) error) error
}
