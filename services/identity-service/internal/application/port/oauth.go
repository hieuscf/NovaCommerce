package port

import (
	"context"

	"github.com/novacommerce/identity-service/internal/domain/entity"
)

// OAuthProvider is the application-layer contract for OAuth2 provider adapters.
// Infrastructure implementations (GoogleProvider, FacebookProvider) must satisfy
// this interface so the use case layer never imports from infrastructure.
type OAuthProvider interface {
	// GetAuthURL returns the provider's consent-page URL with the CSRF state embedded.
	GetAuthURL(state string) string

	// ExchangeCode exchanges an authorisation code for tokens and fetches the
	// authenticated user's profile. Returns apperrors.NewBadRequest when the
	// provider does not return an email address.
	ExchangeCode(ctx context.Context, code string) (*entity.OAuthUserInfo, error)
}

// OAuthStateManager generates and validates CSRF state parameters.
type OAuthStateManager interface {
	// GenerateState creates a one-time random state string backed by Redis (TTL 10m).
	GenerateState(ctx context.Context) (string, error)

	// ValidateState returns true when state was previously issued and has not expired.
	// The state is consumed (deleted) on first successful validation.
	ValidateState(ctx context.Context, state string) bool
}
