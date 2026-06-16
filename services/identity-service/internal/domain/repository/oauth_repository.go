package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/novacommerce/identity-service/internal/domain/entity"
)

// OAuthRepository manages persistence of OAuth-linked accounts.
// Implementations must return pkg/errors types for domain errors:
//   - NewNotFound  — account not found
//   - NewConflict  — (provider, provider_user_id) already linked
//   - NewInternal  — unexpected storage failure
type OAuthRepository interface {
	// FindByProvider retrieves the OAuth account for a given provider and external user ID.
	FindByProvider(ctx context.Context, provider, providerUserID string) (*entity.OAuthAccount, error)

	// FindByUserID returns all OAuth accounts linked to a NovaCommerce user.
	FindByUserID(ctx context.Context, userID uuid.UUID) ([]*entity.OAuthAccount, error)

	// Create persists a new OAuth account. Tokens must be encrypted before calling.
	Create(ctx context.Context, account *entity.OAuthAccount) error

	// Update overwrites an existing OAuth account record (tokens, expiry).
	Update(ctx context.Context, account *entity.OAuthAccount) error

	// Delete removes an OAuth account by its primary key.
	Delete(ctx context.Context, id uuid.UUID) error
}
