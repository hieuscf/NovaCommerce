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

// oauthAccountColumns is the canonical SELECT column list for oauth_accounts.
// Order must match the Scan call in scanOAuthAccount.
const oauthAccountColumns = `id, user_id, provider, provider_user_id,` +
	` email, name, avatar_url, access_token, refresh_token, expires_at,` +
	` created_at, updated_at`

type oauthPostgresRepo struct {
	pool *pgxpool.Pool
}

// NewOAuthPostgresRepo creates a PostgreSQL-backed OAuthRepository.
func NewOAuthPostgresRepo(pool *pgxpool.Pool) repository.OAuthRepository {
	return &oauthPostgresRepo{pool: pool}
}

// FindByProvider retrieves the OAuth account for a (provider, providerUserID) pair.
func (r *oauthPostgresRepo) FindByProvider(ctx context.Context, provider, providerUserID string) (*entity.OAuthAccount, error) {
	query := `
		SELECT ` + oauthAccountColumns + `
		FROM   oauth_accounts
		WHERE  provider = $1 AND provider_user_id = $2
		LIMIT  1`

	row := extractQuerier(ctx, r.pool).QueryRow(ctx, query, provider, providerUserID)
	account, err := scanOAuthAccount(row)
	if err != nil {
		return nil, mapOAuthError("FindByProvider", err)
	}
	return account, nil
}

// FindByUserID returns all OAuth accounts linked to a single NovaCommerce user,
// ordered newest-first.
func (r *oauthPostgresRepo) FindByUserID(ctx context.Context, userID uuid.UUID) ([]*entity.OAuthAccount, error) {
	query := `
		SELECT ` + oauthAccountColumns + `
		FROM   oauth_accounts
		WHERE  user_id = $1
		ORDER  BY created_at DESC`

	rows, err := extractQuerier(ctx, r.pool).Query(ctx, query, userID)
	if err != nil {
		return nil, fmt.Errorf("oauthPostgresRepo.FindByUserID: %w", err)
	}
	defer rows.Close()

	var accounts []*entity.OAuthAccount
	for rows.Next() {
		account, err := scanOAuthAccount(rows)
		if err != nil {
			return nil, fmt.Errorf("oauthPostgresRepo.FindByUserID scan: %w", err)
		}
		accounts = append(accounts, account)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("oauthPostgresRepo.FindByUserID rows: %w", err)
	}
	return accounts, nil
}

// Create inserts a new OAuth account.
// Returns apperrors.NewConflict when (provider, provider_user_id) is already linked.
func (r *oauthPostgresRepo) Create(ctx context.Context, account *entity.OAuthAccount) error {
	query := `
		INSERT INTO oauth_accounts (
			id, user_id, provider, provider_user_id,
			email, name, avatar_url,
			access_token, refresh_token, expires_at,
			created_at, updated_at
		) VALUES (
			$1, $2, $3, $4,
			NULLIF($5, ''), NULLIF($6, ''), NULLIF($7, ''),
			NULLIF($8, ''), NULLIF($9, ''), $10,
			$11, $12
		)
		ON CONFLICT (provider, provider_user_id) DO NOTHING
		RETURNING ` + oauthAccountColumns

	row := extractQuerier(ctx, r.pool).QueryRow(ctx, query,
		account.ID,
		account.UserID,
		account.Provider,
		account.ProviderUserID,
		account.Email,
		account.Name,
		account.AvatarURL,
		account.AccessToken,
		account.RefreshToken,
		account.ExpiresAt,
		account.CreatedAt,
		account.UpdatedAt,
	)

	created, err := scanOAuthAccount(row)
	if err != nil {
		// ON CONFLICT DO NOTHING causes ErrNoRows when the row already exists.
		if errors.Is(err, pgx.ErrNoRows) {
			return apperrors.NewConflict("oauth account already linked for this provider")
		}
		return fmt.Errorf("oauthPostgresRepo.Create: %w", err)
	}

	*account = *created
	return nil
}

// Update overwrites the mutable fields of an existing OAuth account.
// updated_at is managed by the DB trigger; setting it explicitly in the query
// ensures the returned value is current even when triggers are disabled (tests).
func (r *oauthPostgresRepo) Update(ctx context.Context, account *entity.OAuthAccount) error {
	query := `
		UPDATE oauth_accounts
		SET    email         = NULLIF($2, ''),
		       name          = NULLIF($3, ''),
		       avatar_url    = NULLIF($4, ''),
		       access_token  = NULLIF($5, ''),
		       refresh_token = NULLIF($6, ''),
		       expires_at    = $7,
		       updated_at    = NOW()
		WHERE  id = $1
		RETURNING ` + oauthAccountColumns

	row := extractQuerier(ctx, r.pool).QueryRow(ctx, query,
		account.ID,
		account.Email,
		account.Name,
		account.AvatarURL,
		account.AccessToken,
		account.RefreshToken,
		account.ExpiresAt,
	)

	updated, err := scanOAuthAccount(row)
	if err != nil {
		return mapOAuthError("Update", err)
	}

	*account = *updated
	return nil
}

// Delete hard-deletes an OAuth account by primary key.
func (r *oauthPostgresRepo) Delete(ctx context.Context, id uuid.UUID) error {
	tag, err := extractQuerier(ctx, r.pool).Exec(ctx, `DELETE FROM oauth_accounts WHERE id = $1`, id)
	if err != nil {
		return fmt.Errorf("oauthPostgresRepo.Delete: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return apperrors.NewNotFound("oauth account not found")
	}
	return nil
}

// scanOAuthAccount reads one row from either pgx.Row or pgx.Rows into an OAuthAccount.
// Nullable string columns are scanned into *string then coerced to "" when NULL.
func scanOAuthAccount(row pgx.Row) (*entity.OAuthAccount, error) {
	var a entity.OAuthAccount
	var email, name, avatarURL, accessToken, refreshToken *string

	err := row.Scan(
		&a.ID,
		&a.UserID,
		&a.Provider,
		&a.ProviderUserID,
		&email,
		&name,
		&avatarURL,
		&accessToken,
		&refreshToken,
		&a.ExpiresAt,
		&a.CreatedAt,
		&a.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	if email != nil {
		a.Email = *email
	}
	if name != nil {
		a.Name = *name
	}
	if avatarURL != nil {
		a.AvatarURL = *avatarURL
	}
	if accessToken != nil {
		a.AccessToken = *accessToken
	}
	if refreshToken != nil {
		a.RefreshToken = *refreshToken
	}

	return &a, nil
}

func mapOAuthError(method string, err error) error {
	if errors.Is(err, pgx.ErrNoRows) {
		return apperrors.NewNotFound("oauth account not found")
	}
	return fmt.Errorf("oauthPostgresRepo.%s: %w", method, err)
}
