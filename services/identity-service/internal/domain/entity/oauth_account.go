package entity

import (
	"time"

	"github.com/google/uuid"
)

// OAuthAccount links an external OAuth provider identity to a NovaCommerce user.
// AccessToken and RefreshToken are stored encrypted at rest (AES-256-GCM) by the
// persistence layer; the domain entity holds the plaintext values.
type OAuthAccount struct {
	ID             uuid.UUID  `db:"id"`
	UserID         uuid.UUID  `db:"user_id"`
	Provider       string     `db:"provider"`
	ProviderUserID string     `db:"provider_user_id"`
	Email          string     `db:"email"`
	Name           string     `db:"name"`
	AvatarURL      string     `db:"avatar_url"`
	AccessToken    string     `db:"access_token"`
	RefreshToken   string     `db:"refresh_token"`
	ExpiresAt      *time.Time `db:"expires_at"`
	CreatedAt      time.Time  `db:"created_at"`
	UpdatedAt      time.Time  `db:"updated_at"`
}

// IsExpired reports whether the provider access token has passed its expiry time.
// Returns false when ExpiresAt is nil (no expiry set by the provider).
func (o *OAuthAccount) IsExpired() bool {
	if o.ExpiresAt == nil {
		return false
	}
	return time.Now().After(*o.ExpiresAt)
}
