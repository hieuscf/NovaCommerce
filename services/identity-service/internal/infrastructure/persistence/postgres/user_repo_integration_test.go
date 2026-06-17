//go:build integration

package postgres_test

import (
	"context"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/novacommerce/identity-service/internal/domain/entity"
	"github.com/novacommerce/identity-service/internal/domain/repository"
	"github.com/novacommerce/identity-service/internal/infrastructure/persistence/postgres"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestUserRepository_Integration(t *testing.T) {
	ctx := context.Background()
	container, connStr := startPostgresContainer(t, ctx)
	t.Cleanup(func() {
		_ = container.Terminate(ctx)
	})

	runMigrations(t, connStr)
	pool := initPool(t, ctx, connStr)
	t.Cleanup(pool.Close)

	repo := postgres.NewUserPostgresRepo(pool)

	t.Run("Create and FindByEmail", func(t *testing.T) {
		user := &entity.User{
			ID:        uuid.New(),
			Username:  "integrationuser",
			Email:     "integration@example.com",
			FullName:  "Integration User",
			Status:    entity.UserStatusActive,
			CreatedAt: time.Now().UTC(),
			UpdatedAt: time.Now().UTC(),
		}
		require.NoError(t, user.SetPassword("SecurePass123"))
		require.NoError(t, repo.Create(ctx, user))

		found, err := repo.FindByEmail(ctx, user.Email)
		require.NoError(t, err)
		assert.Equal(t, user.Email, found.Email)
		assert.Equal(t, user.Username, found.Username)
	})

	t.Run("FindByEmailOrUsername with email", func(t *testing.T) {
		found, err := repo.FindByEmailOrUsername(ctx, "integration@example.com")
		require.NoError(t, err)
		assert.Equal(t, "integration@example.com", found.Email)
	})

	t.Run("FindByEmailOrUsername with username", func(t *testing.T) {
		found, err := repo.FindByEmailOrUsername(ctx, "integrationuser")
		require.NoError(t, err)
		assert.Equal(t, "integrationuser", found.Username)
	})

	t.Run("UpdatePassword", func(t *testing.T) {
		found, err := repo.FindByEmail(ctx, "integration@example.com")
		require.NoError(t, err)

		require.NoError(t, found.SetPassword("NewSecure456"))
		require.NoError(t, repo.UpdatePassword(ctx, found.ID, found.PasswordHash))

		updated, err := repo.FindByID(ctx, found.ID)
		require.NoError(t, err)
		assert.True(t, updated.CheckPassword("NewSecure456"))
	})

	t.Run("UpdateLastLogin", func(t *testing.T) {
		found, err := repo.FindByEmail(ctx, "integration@example.com")
		require.NoError(t, err)

		require.NoError(t, repo.UpdateLastLogin(ctx, found.ID))

		updated, err := repo.FindByID(ctx, found.ID)
		require.NoError(t, err)
		assert.NotNil(t, updated.LastLoginAt)
	})

	t.Run("Update profile fields", func(t *testing.T) {
		found, err := repo.FindByEmail(ctx, "integration@example.com")
		require.NoError(t, err)

		found.FullName = "Updated Integration User"
		found.Phone = "+84901234567"
		found.AvatarURL = "https://example.com/avatar.png"
		require.NoError(t, repo.Update(ctx, found))

		updated, err := repo.FindByID(ctx, found.ID)
		require.NoError(t, err)
		assert.Equal(t, "Updated Integration User", updated.FullName)
		assert.Equal(t, "+84901234567", updated.Phone)
		assert.Equal(t, "https://example.com/avatar.png", updated.AvatarURL)
	})

	t.Run("UpdateStatus", func(t *testing.T) {
		found, err := repo.FindByEmail(ctx, "integration@example.com")
		require.NoError(t, err)

		updated, err := repo.UpdateStatus(ctx, found.ID, entity.UserStatusInactive)
		require.NoError(t, err)
		assert.Equal(t, entity.UserStatusInactive, updated.Status)
	})

	t.Run("List with cursor pagination", func(t *testing.T) {
		users, total, err := repo.List(ctx, repository.UserFilter{}, "", 10)
		require.NoError(t, err)
		assert.GreaterOrEqual(t, total, int64(1))
		assert.NotEmpty(t, users)

		active := entity.UserStatusActive
		filtered, filteredTotal, err := repo.List(ctx, repository.UserFilter{Status: &active}, "", 10)
		require.NoError(t, err)
		assert.GreaterOrEqual(t, filteredTotal, int64(0))
		for _, u := range filtered {
			assert.Equal(t, entity.UserStatusActive, u.Status)
		}
	})

	t.Run("List with search filter", func(t *testing.T) {
		users, total, err := repo.List(ctx, repository.UserFilter{Search: "integration"}, "", 10)
		require.NoError(t, err)
		assert.GreaterOrEqual(t, total, int64(1))
		require.NotEmpty(t, users)
		assert.Contains(t, users[0].Email, "integration")
	})
}
