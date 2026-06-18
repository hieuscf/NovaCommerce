package usecase

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/novacommerce/identity-service/internal/domain/repository"
)

const defaultCustomerRoleName = "customer"

func loadRoleNames(ctx context.Context, roleRepo repository.RoleRepository, userID uuid.UUID) ([]string, error) {
	roles, err := roleRepo.GetUserRoles(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("load user roles: %w", err)
	}

	names := make([]string, 0, len(roles))
	for _, role := range roles {
		names = append(names, role.Name)
	}
	return names, nil
}

func assignDefaultCustomerRole(ctx context.Context, roleRepo repository.RoleRepository, userID uuid.UUID) error {
	role, err := roleRepo.FindByName(ctx, defaultCustomerRoleName)
	if err != nil {
		return fmt.Errorf("assign default customer role: %w", err)
	}

	if err := roleRepo.AssignRole(ctx, userID, role.ID); err != nil {
		return fmt.Errorf("assign default customer role: %w", err)
	}

	return nil
}
