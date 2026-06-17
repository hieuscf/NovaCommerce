//go:build integration

package postgres_test

import (
	"context"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/novacommerce/identity-service/internal/domain/entity"
	"github.com/novacommerce/identity-service/internal/infrastructure/persistence/postgres"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestRoleRepository_Integration(t *testing.T) {
	ctx := context.Background()
	container, connStr := startPostgresContainer(t, ctx)
	t.Cleanup(func() {
		_ = container.Terminate(ctx)
	})

	runMigrations(t, connStr)
	pool := initPool(t, ctx, connStr)
	t.Cleanup(pool.Close)

	userRepo := postgres.NewUserPostgresRepo(pool)
	roleRepo := postgres.NewRolePostgresRepo(pool)

	user := &entity.User{
		ID:        uuid.New(),
		Username:  "roleuser",
		Email:     "roleuser@example.com",
		FullName:  "Role User",
		Status:    entity.UserStatusActive,
		CreatedAt: time.Now().UTC(),
		UpdatedAt: time.Now().UTC(),
	}
	require.NoError(t, user.SetPassword("SecurePass123"))
	require.NoError(t, userRepo.Create(ctx, user))

	roles, err := roleRepo.List(ctx)
	require.NoError(t, err)
	require.NotEmpty(t, roles)

	customerRole := findRoleByName(t, roles, "customer")
	require.NotNil(t, customerRole)

	t.Run("GetUserRoles returns empty for new user", func(t *testing.T) {
		got, err := roleRepo.GetUserRoles(ctx, user.ID)
		require.NoError(t, err)
		assert.Empty(t, got)
	})

	t.Run("AssignRole and GetUserRoles", func(t *testing.T) {
		require.NoError(t, roleRepo.AssignRole(ctx, user.ID, customerRole.ID))

		got, err := roleRepo.GetUserRoles(ctx, user.ID)
		require.NoError(t, err)
		require.Len(t, got, 1)
		assert.Equal(t, customerRole.ID, got[0].ID)
		assert.Equal(t, "customer", got[0].Name)
	})

	t.Run("AssignRole conflict on duplicate", func(t *testing.T) {
		err := roleRepo.AssignRole(ctx, user.ID, customerRole.ID)
		require.Error(t, err)
	})

	t.Run("RoleExists", func(t *testing.T) {
		exists, err := roleRepo.RoleExists(ctx, customerRole.ID)
		require.NoError(t, err)
		assert.True(t, exists)

		exists, err = roleRepo.RoleExists(ctx, uuid.New())
		require.NoError(t, err)
		assert.False(t, exists)
	})

	t.Run("RevokeRole", func(t *testing.T) {
		require.NoError(t, roleRepo.RevokeRole(ctx, user.ID, customerRole.ID))

		got, err := roleRepo.GetUserRoles(ctx, user.ID)
		require.NoError(t, err)
		assert.Empty(t, got)
	})
}

func findRoleByName(t *testing.T, roles []*entity.Role, name string) *entity.Role {
	t.Helper()
	for _, role := range roles {
		if role.Name == name {
			return role
		}
	}
	return nil
}
