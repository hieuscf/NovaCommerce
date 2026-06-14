package postgres

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/novacommerce/identity-service/internal/domain/entity"
	"github.com/novacommerce/identity-service/internal/domain/repository"
	apperrors "github.com/novacommerce/pkg/errors"
)

const passwordResetTokenColumns = `id, user_id, token_hash, expires_at, used_at, created_at`

type passwordResetPostgresRepo struct {
	pool *pgxpool.Pool
}

// NewPasswordResetPostgresRepo creates a PostgreSQL-backed PasswordResetTokenRepository.
func NewPasswordResetPostgresRepo(pool *pgxpool.Pool) repository.PasswordResetTokenRepository {
	return &passwordResetPostgresRepo{pool: pool}
}

func (r *passwordResetPostgresRepo) Create(ctx context.Context, token *entity.PasswordResetToken) error {
	query := `
		INSERT INTO password_reset_tokens (id, user_id, token_hash, expires_at, created_at)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING ` + passwordResetTokenColumns

	row := r.pool.QueryRow(ctx, query,
		token.ID,
		token.UserID,
		token.TokenHash,
		token.ExpiresAt,
		token.CreatedAt,
	)

	created, err := scanPasswordResetToken(row)
	if err != nil {
		return fmt.Errorf("passwordResetPostgresRepo.Create: %w", err)
	}

	*token = *created
	return nil
}

func (r *passwordResetPostgresRepo) FindByTokenHash(ctx context.Context, hash string) (*entity.PasswordResetToken, error) {
	query := `
		SELECT ` + passwordResetTokenColumns + `
		FROM password_reset_tokens
		WHERE token_hash = $1 AND used_at IS NULL AND expires_at > NOW()
		LIMIT 1
	`

	row := r.pool.QueryRow(ctx, query, hash)
	token, err := scanPasswordResetToken(row)
	if err != nil {
		return nil, mapPasswordResetError("FindByTokenHash", err)
	}
	return token, nil
}

func (r *passwordResetPostgresRepo) MarkUsed(ctx context.Context, id uuid.UUID) error {
	tag, err := r.pool.Exec(ctx, `
		UPDATE password_reset_tokens
		SET used_at = NOW()
		WHERE id = $1 AND used_at IS NULL
	`, id)
	if err != nil {
		return fmt.Errorf("passwordResetPostgresRepo.MarkUsed: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return apperrors.NewNotFound("password reset token not found")
	}
	return nil
}

func (r *passwordResetPostgresRepo) DeleteExpiredByUserID(ctx context.Context, userID uuid.UUID) error {
	_, err := r.pool.Exec(ctx, `
		DELETE FROM password_reset_tokens
		WHERE user_id = $1 AND (expires_at < NOW() OR used_at IS NOT NULL)
	`, userID)
	if err != nil {
		return fmt.Errorf("passwordResetPostgresRepo.DeleteExpiredByUserID: %w", err)
	}
	return nil
}

func scanPasswordResetToken(row pgx.Row) (*entity.PasswordResetToken, error) {
	var token entity.PasswordResetToken
	err := row.Scan(
		&token.ID,
		&token.UserID,
		&token.TokenHash,
		&token.ExpiresAt,
		&token.UsedAt,
		&token.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &token, nil
}

func mapPasswordResetError(method string, err error) error {
	if errors.Is(err, pgx.ErrNoRows) {
		return apperrors.NewNotFound("password reset token not found")
	}
	return fmt.Errorf("passwordResetPostgresRepo.%s: %w", method, err)
}
