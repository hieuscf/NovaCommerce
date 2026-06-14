//go:build integration

package postgres_test

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/novacommerce/identity-service/internal/domain/entity"
	"github.com/novacommerce/identity-service/internal/infrastructure/persistence/postgres"
	apperrors "github.com/novacommerce/pkg/errors"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func hashToken(raw string) string {
	sum := sha256.Sum256([]byte(raw))
	return hex.EncodeToString(sum[:])
}

func TestRefreshTokenRepository_Integration(t *testing.T) {
	ctx := context.Background()
	container, connStr := startPostgresContainer(t, ctx)
	t.Cleanup(func() {
		_ = container.Terminate(ctx)
	})

	runMigrations(t, connStr)
	pool := initPool(t, ctx, connStr)
	t.Cleanup(pool.Close)

	userRepo := postgres.NewUserPostgresRepo(pool)
	repo := postgres.NewRefreshTokenPostgresRepo(pool)

	user := &entity.User{
		ID:        uuid.New(),
		Username:  "tokenuser",
		Email:     "tokenuser@example.com",
		FullName:  "Token User",
		Status:    entity.UserStatusActive,
		CreatedAt: time.Now().UTC(),
		UpdatedAt: time.Now().UTC(),
	}
	require.NoError(t, user.SetPassword("SecurePass123"))
	require.NoError(t, userRepo.Create(ctx, user))

	rawToken := "integration-refresh-token-32-characters"
	tokenHash := hashToken(rawToken)

	t.Run("Create and FindByTokenHash", func(t *testing.T) {
		token := &entity.RefreshToken{
			ID:        uuid.New(),
			UserID:    user.ID,
			TokenHash: tokenHash,
			ExpiresAt: time.Now().Add(24 * time.Hour),
			IPAddress: "127.0.0.1",
			UserAgent: "integration-test",
			CreatedAt: time.Now().UTC(),
		}
		require.NoError(t, repo.Create(ctx, token))

		found, err := repo.FindByTokenHash(ctx, tokenHash)
		require.NoError(t, err)
		assert.Equal(t, token.ID, found.ID)
		assert.Equal(t, "127.0.0.1", found.IPAddress)
	})

	t.Run("RevokeByID makes FindByTokenHash fail", func(t *testing.T) {
		found, err := repo.FindByTokenHash(ctx, tokenHash)
		require.NoError(t, err)

		require.NoError(t, repo.RevokeByID(ctx, found.ID))

		_, err = repo.FindByTokenHash(ctx, tokenHash)
		require.Error(t, err)
		appErr, ok := apperrors.IsAppError(err)
		require.True(t, ok)
		assert.True(t, apperrors.IsNotFound(err) || appErr.Code == apperrors.ErrCodeNotFound)
	})

	t.Run("RevokeAllByUserID revokes all user tokens", func(t *testing.T) {
		secondRaw := "second-refresh-token-32-characters-min"
		secondHash := hashToken(secondRaw)

		for _, item := range []struct {
			raw  string
			hash string
		}{
			{raw: "third-refresh-token-32-characters-min", hash: hashToken("third-refresh-token-32-characters-min")},
			{raw: secondRaw, hash: secondHash},
		} {
			require.NoError(t, repo.Create(ctx, &entity.RefreshToken{
				ID:        uuid.New(),
				UserID:    user.ID,
				TokenHash: item.hash,
				ExpiresAt: time.Now().Add(24 * time.Hour),
				CreatedAt: time.Now().UTC(),
			}))
		}

		require.NoError(t, repo.RevokeAllByUserID(ctx, user.ID))

		_, err := repo.FindByTokenHash(ctx, secondHash)
		require.Error(t, err)
	})

	t.Run("DeleteExpired removes only expired tokens", func(t *testing.T) {
		activeRaw := "active-refresh-token-32-characters-min"
		activeHash := hashToken(activeRaw)
		expiredHash := hashToken("expired-refresh-token-32-characters-min")

		require.NoError(t, repo.Create(ctx, &entity.RefreshToken{
			ID:        uuid.New(),
			UserID:    user.ID,
			TokenHash: activeHash,
			ExpiresAt: time.Now().Add(24 * time.Hour),
			CreatedAt: time.Now().UTC(),
		}))
		require.NoError(t, repo.Create(ctx, &entity.RefreshToken{
			ID:        uuid.New(),
			UserID:    user.ID,
			TokenHash: expiredHash,
			ExpiresAt: time.Now().Add(-time.Hour),
			CreatedAt: time.Now().UTC(),
		}))

		require.NoError(t, repo.DeleteExpired(ctx))

		_, err := repo.FindByTokenHash(ctx, expiredHash)
		require.Error(t, err)

		_, err = repo.FindByTokenHash(ctx, activeHash)
		require.NoError(t, err)
	})
}
