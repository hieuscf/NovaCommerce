package port

import (
	"github.com/google/uuid"
)

// Claims holds validated JWT access token claims.
type Claims struct {
	UserID uuid.UUID
	Email  string
	Roles  []string
}

// JWTService issues and validates access tokens.
type JWTService interface {
	GenerateAccessToken(userID uuid.UUID, email string, roles []string) (string, error)
	ValidateAccessToken(token string) (*Claims, error)
}
