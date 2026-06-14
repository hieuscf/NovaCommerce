package entity

import (
	"time"

	"github.com/google/uuid"
)

// PasswordResetTokenTTL is the default lifetime for password reset tokens.
const PasswordResetTokenTTL = time.Hour

// PasswordResetToken stores a hashed one-time password reset token.
type PasswordResetToken struct {
	ID        uuid.UUID  `db:"id"`
	UserID    uuid.UUID  `db:"user_id"`
	TokenHash string     `db:"token_hash"`
	ExpiresAt time.Time  `db:"expires_at"`
	UsedAt    *time.Time `db:"used_at"`
	CreatedAt time.Time  `db:"created_at"`
}

// IsValid reports whether the token is unused and not expired.
func (p *PasswordResetToken) IsValid() bool {
	if p.UsedAt != nil {
		return false
	}
	return time.Now().Before(p.ExpiresAt)
}
