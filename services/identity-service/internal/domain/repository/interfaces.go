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
