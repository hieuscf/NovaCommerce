package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/novacommerce/identity-service/internal/domain/entity"
)

// RoleRepository manages role persistence and user-role assignments.
type RoleRepository interface {
	Create(ctx context.Context, role *entity.Role) error
	FindByID(ctx context.Context, id uuid.UUID) (*entity.Role, error)
	FindByName(ctx context.Context, name string) (*entity.Role, error)
	List(ctx context.Context) ([]*entity.Role, error)
	GetUserRoles(ctx context.Context, userID uuid.UUID) ([]*entity.Role, error)
	AssignRole(ctx context.Context, userID, roleID uuid.UUID) error
	RevokeRole(ctx context.Context, userID, roleID uuid.UUID) error
	RoleExists(ctx context.Context, roleID uuid.UUID) (bool, error)
	CountUsersWithRole(ctx context.Context, roleID uuid.UUID) (int, error)
}
