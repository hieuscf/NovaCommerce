package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/novacommerce/identity-service/internal/domain/entity"
)

// UserFilter scopes user list queries.
type UserFilter struct {
	Status *entity.UserStatus
	Role   string
	Search string
}

// UserRepository persists and retrieves users.
// Implementations should return pkg/errors types: NewNotFound, NewConflict, NewUnauthorized.
type UserRepository interface {
	Create(ctx context.Context, user *entity.User) error
	FindByID(ctx context.Context, id uuid.UUID) (*entity.User, error)
	FindByEmail(ctx context.Context, email string) (*entity.User, error)
	FindByUsername(ctx context.Context, username string) (*entity.User, error)
	FindByEmailOrUsername(ctx context.Context, identifier string) (*entity.User, error)
	Update(ctx context.Context, user *entity.User) error
	UpdatePassword(ctx context.Context, userID uuid.UUID, passwordHash string) error
	UpdateLastLogin(ctx context.Context, userID uuid.UUID) error
	List(ctx context.Context, filter UserFilter, cursor string, limit int) ([]*entity.User, int64, error)
	UpdateStatus(ctx context.Context, userID uuid.UUID, status entity.UserStatus) (*entity.User, error)
}
