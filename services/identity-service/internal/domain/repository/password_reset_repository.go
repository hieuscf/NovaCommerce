package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/novacommerce/identity-service/internal/domain/entity"
)

// PasswordResetTokenRepository manages password reset token persistence.
// Implementations should return pkg/errors types: NewNotFound, NewConflict, NewUnauthorized.
type PasswordResetTokenRepository interface {
	Create(ctx context.Context, token *entity.PasswordResetToken) error
	FindByTokenHash(ctx context.Context, hash string) (*entity.PasswordResetToken, error)
	MarkUsed(ctx context.Context, id uuid.UUID) error
	DeleteExpiredByUserID(ctx context.Context, userID uuid.UUID) error
}
