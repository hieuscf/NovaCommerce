package postgres

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/novacommerce/identity-service/internal/domain/entity"
	"github.com/novacommerce/identity-service/internal/domain/repository"
	apperrors "github.com/novacommerce/pkg/errors"
)

const refreshTokenColumns = `id, user_id, token_hash, expires_at, revoked_at, device_info, created_at`

type refreshTokenPostgresRepo struct {
	pool *pgxpool.Pool
}

// NewRefreshTokenPostgresRepo creates a PostgreSQL-backed RefreshTokenRepository.
func NewRefreshTokenPostgresRepo(pool *pgxpool.Pool) repository.RefreshTokenRepository {
	return &refreshTokenPostgresRepo{pool: pool}
}

func (r *refreshTokenPostgresRepo) Create(ctx context.Context, token *entity.RefreshToken) error {
	deviceInfo, err := encodeDeviceInfo(token.IPAddress, token.UserAgent)
	if err != nil {
		return fmt.Errorf("refreshTokenPostgresRepo.Create: %w", err)
	}

	query := `
		INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at, device_info, created_at)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING ` + refreshTokenColumns

	row := r.pool.QueryRow(ctx, query,
		token.ID,
		token.UserID,
		token.TokenHash,
		token.ExpiresAt,
		deviceInfo,
		token.CreatedAt,
	)

	created, err := scanRefreshToken(row)
	if err != nil {
		return fmt.Errorf("refreshTokenPostgresRepo.Create: %w", err)
	}

	*token = *created
	return nil
}

func (r *refreshTokenPostgresRepo) FindByTokenHash(ctx context.Context, hash string) (*entity.RefreshToken, error) {
	query := `
		SELECT ` + refreshTokenColumns + `
		FROM refresh_tokens
		WHERE token_hash = $1 AND revoked_at IS NULL AND status = 'active'
		LIMIT 1
	`

	row := r.pool.QueryRow(ctx, query, hash)
	token, err := scanRefreshToken(row)
	if err != nil {
		return nil, mapRefreshTokenError("FindByTokenHash", err)
	}
	return token, nil
}

func (r *refreshTokenPostgresRepo) RevokeByID(ctx context.Context, id uuid.UUID) error {
	tag, err := r.pool.Exec(ctx, `
		UPDATE refresh_tokens
		SET revoked_at = NOW(), status = 'revoked'
		WHERE id = $1 AND revoked_at IS NULL
	`, id)
	if err != nil {
		return fmt.Errorf("refreshTokenPostgresRepo.RevokeByID: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return apperrors.NewNotFound("refresh token not found")
	}
	return nil
}

func (r *refreshTokenPostgresRepo) RevokeAllByUserID(ctx context.Context, userID uuid.UUID) error {
	_, err := r.pool.Exec(ctx, `
		UPDATE refresh_tokens
		SET revoked_at = NOW(), status = 'revoked'
		WHERE user_id = $1 AND revoked_at IS NULL
	`, userID)
	if err != nil {
		return fmt.Errorf("refreshTokenPostgresRepo.RevokeAllByUserID: %w", err)
	}
	return nil
}

func (r *refreshTokenPostgresRepo) DeleteExpired(ctx context.Context) error {
	_, err := r.pool.Exec(ctx, `
		DELETE FROM refresh_tokens
		WHERE expires_at < NOW()
	`)
	if err != nil {
		return fmt.Errorf("refreshTokenPostgresRepo.DeleteExpired: %w", err)
	}
	return nil
}

func scanRefreshToken(row pgx.Row) (*entity.RefreshToken, error) {
	var token entity.RefreshToken
	var deviceInfo []byte

	err := row.Scan(
		&token.ID,
		&token.UserID,
		&token.TokenHash,
		&token.ExpiresAt,
		&token.RevokedAt,
		&deviceInfo,
		&token.CreatedAt,
	)
	if err != nil {
		return nil, err
	}

	if len(deviceInfo) > 0 {
		ip, ua, decodeErr := decodeDeviceInfo(deviceInfo)
		if decodeErr != nil {
			return nil, decodeErr
		}
		token.IPAddress = ip
		token.UserAgent = ua
	}

	return &token, nil
}

type deviceInfoPayload struct {
	IPAddress string `json:"ip_address"`
	UserAgent string `json:"user_agent"`
}

func encodeDeviceInfo(ipAddress, userAgent string) ([]byte, error) {
	if ipAddress == "" && userAgent == "" {
		return nil, nil
	}
	return json.Marshal(deviceInfoPayload{
		IPAddress: ipAddress,
		UserAgent: userAgent,
	})
}

func decodeDeviceInfo(data []byte) (string, string, error) {
	var payload deviceInfoPayload
	if err := json.Unmarshal(data, &payload); err != nil {
		return "", "", fmt.Errorf("decode device info: %w", err)
	}
	return payload.IPAddress, payload.UserAgent, nil
}

func mapRefreshTokenError(method string, err error) error {
	if errors.Is(err, pgx.ErrNoRows) {
		return apperrors.NewNotFound("refresh token not found")
	}
	return fmt.Errorf("refreshTokenPostgresRepo.%s: %w", method, err)
}
