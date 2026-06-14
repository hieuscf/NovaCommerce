package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/novacommerce/identity-service/internal/domain/entity"
)

// UserFilter scopes user list queries.
type UserFilter struct {
	Status *entity.UserStatus
	Limit  int
	Offset int
}

// UserRepository persists and retrieves users.
type UserRepository interface {
	Create(ctx context.Context, user *entity.User) error
	FindByID(ctx context.Context, id uuid.UUID) (*entity.User, error)
	FindByEmail(ctx context.Context, email string) (*entity.User, error)
	FindByUsername(ctx context.Context, username string) (*entity.User, error)
	Update(ctx context.Context, user *entity.User) error
	SoftDelete(ctx context.Context, id uuid.UUID) error
	List(ctx context.Context, filter UserFilter) ([]*entity.User, error)
}

// RefreshTokenRepository manages refresh token persistence.
type RefreshTokenRepository interface {
	Create(ctx context.Context, token *entity.RefreshToken) error
	FindByTokenHash(ctx context.Context, hash string) (*entity.RefreshToken, error)
	RevokeByID(ctx context.Context, id uuid.UUID) error
	RevokeAllByUserID(ctx context.Context, userID uuid.UUID) error
}

// RoleRepository manages role persistence.
type RoleRepository interface {
	Create(ctx context.Context, role *entity.Role) error
	FindByID(ctx context.Context, id uuid.UUID) (*entity.Role, error)
	FindByName(ctx context.Context, name string) (*entity.Role, error)
	List(ctx context.Context) ([]*entity.Role, error)
	AssignToUser(ctx context.Context, userID, roleID uuid.UUID) error
	RevokeFromUser(ctx context.Context, userID, roleID uuid.UUID) error
	ListByUserID(ctx context.Context, userID uuid.UUID) ([]*entity.Role, error)
}

// PermissionRepository manages permission persistence.
type PermissionRepository interface {
	Create(ctx context.Context, permission *entity.Permission) error
	FindByID(ctx context.Context, id uuid.UUID) (*entity.Permission, error)
	List(ctx context.Context) ([]*entity.Permission, error)
	AssignToRole(ctx context.Context, roleID, permissionID uuid.UUID) error
	RevokeFromRole(ctx context.Context, roleID, permissionID uuid.UUID) error
	ListByRoleID(ctx context.Context, roleID uuid.UUID) ([]*entity.Permission, error)
}
