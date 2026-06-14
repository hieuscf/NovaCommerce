package entity

import (
	"time"

	"github.com/google/uuid"
)

// RefreshToken stores a hashed refresh token for a user session.
type RefreshToken struct {
	ID        uuid.UUID  `db:"id"`
	UserID    uuid.UUID  `db:"user_id"`
	TokenHash string     `db:"token_hash"`
	ExpiresAt time.Time  `db:"expires_at"`
	RevokedAt *time.Time `db:"revoked_at"`
	IPAddress string     `db:"ip_address"`
	UserAgent string     `db:"user_agent"`
	CreatedAt time.Time  `db:"created_at"`
}

// IsValid reports whether the token is neither revoked nor expired.
func (r *RefreshToken) IsValid() bool {
	if r.RevokedAt != nil {
		return false
	}
	return time.Now().Before(r.ExpiresAt)
}
