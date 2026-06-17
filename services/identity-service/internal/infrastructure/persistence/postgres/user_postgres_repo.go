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
	"github.com/novacommerce/pkg/pagination"
)

const userColumns = `id, username, email, password_hash, phone, full_name, avatar_url, status, last_login_at, created_at, updated_at`

type userPostgresRepo struct {
	pool *pgxpool.Pool
}

// NewUserPostgresRepo creates a PostgreSQL-backed UserRepository.
func NewUserPostgresRepo(pool *pgxpool.Pool) repository.UserRepository {
	return &userPostgresRepo{pool: pool}
}

func (r *userPostgresRepo) Create(ctx context.Context, user *entity.User) error {
	query := `
		INSERT INTO users (
			id, username, email, password_hash, phone, full_name, avatar_url, status, created_at, updated_at
		) VALUES ($1, $2, $3, $4, NULLIF($5, ''), $6, NULLIF($7, ''), $8, $9, $10)
		RETURNING ` + userColumns

	row := extractQuerier(ctx, r.pool).QueryRow(ctx, query,
		user.ID,
		user.Username,
		user.Email,
		user.PasswordHash,
		user.Phone,
		user.FullName,
		user.AvatarURL,
		user.Status,
		user.CreatedAt,
		user.UpdatedAt,
	)

	created, err := scanUser(row)
	if err != nil {
		return fmt.Errorf("userPostgresRepo.Create: %w", err)
	}

	*user = *created
	return nil
}

func (r *userPostgresRepo) FindByID(ctx context.Context, id uuid.UUID) (*entity.User, error) {
	query := `SELECT ` + userColumns + ` FROM users WHERE id = $1 LIMIT 1`
	return r.findOne(ctx, query, id)
}

func (r *userPostgresRepo) FindByEmail(ctx context.Context, email string) (*entity.User, error) {
	query := `SELECT ` + userColumns + ` FROM users WHERE email = $1 LIMIT 1`
	return r.findOne(ctx, query, email)
}

func (r *userPostgresRepo) FindByUsername(ctx context.Context, username string) (*entity.User, error) {
	query := `SELECT ` + userColumns + ` FROM users WHERE username = $1 LIMIT 1`
	return r.findOne(ctx, query, username)
}

func (r *userPostgresRepo) FindByEmailOrUsername(ctx context.Context, identifier string) (*entity.User, error) {
	query := `SELECT ` + userColumns + ` FROM users WHERE (email = $1 OR username = $1) LIMIT 1`
	return r.findOne(ctx, query, identifier)
}

func (r *userPostgresRepo) Update(ctx context.Context, user *entity.User) error {
	query := `
		UPDATE users
		SET full_name = $2,
		    phone = NULLIF($3, ''),
		    avatar_url = NULLIF($4, ''),
		    updated_at = NOW()
		WHERE id = $1
		RETURNING ` + userColumns

	row := extractQuerier(ctx, r.pool).QueryRow(ctx, query,
		user.ID,
		user.FullName,
		user.Phone,
		user.AvatarURL,
	)

	updated, err := scanUser(row)
	if err != nil {
		return mapUserError("Update", err)
	}

	*user = *updated
	return nil
}

func (r *userPostgresRepo) List(ctx context.Context, filter repository.UserFilter, cursor string, limit int) ([]*entity.User, int64, error) {
	if limit <= 0 {
		limit = 20
	}
	if limit > 100 {
		limit = 100
	}

	total, err := r.countUsers(ctx, filter)
	if err != nil {
		return nil, 0, err
	}

	query := `SELECT ` + userColumns + ` FROM users WHERE 1=1`
	args := make([]any, 0, 4)
	argPos := 1

	if filter.Status != nil {
		query += fmt.Sprintf(" AND status = $%d", argPos)
		args = append(args, *filter.Status)
		argPos++
	}

	if cursor != "" {
		cursorID, cursorCreatedAt, err := pagination.DecodeCursor(cursor)
		if err != nil {
			return nil, 0, apperrors.NewBadRequest("invalid cursor")
		}

		cursorUUID, err := uuid.Parse(cursorID)
		if err != nil {
			return nil, 0, apperrors.NewBadRequest("invalid cursor")
		}

		query += fmt.Sprintf(
			" AND (created_at < $%d OR (created_at = $%d AND id < $%d))",
			argPos, argPos, argPos+1,
		)
		args = append(args, cursorCreatedAt, cursorUUID)
		argPos += 2
	}

	query += fmt.Sprintf(" ORDER BY created_at DESC, id DESC LIMIT $%d", argPos)
	args = append(args, limit)

	rows, err := extractQuerier(ctx, r.pool).Query(ctx, query, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("userPostgresRepo.List: %w", err)
	}
	defer rows.Close()

	users := make([]*entity.User, 0, limit)
	for rows.Next() {
		user, err := scanUser(rows)
		if err != nil {
			return nil, 0, fmt.Errorf("userPostgresRepo.List scan: %w", err)
		}
		users = append(users, user)
	}
	if err := rows.Err(); err != nil {
		return nil, 0, fmt.Errorf("userPostgresRepo.List rows: %w", err)
	}

	return users, total, nil
}

func (r *userPostgresRepo) UpdateStatus(ctx context.Context, userID uuid.UUID, status entity.UserStatus) (*entity.User, error) {
	query := `
		UPDATE users
		SET status = $2, updated_at = NOW()
		WHERE id = $1
		RETURNING ` + userColumns

	row := extractQuerier(ctx, r.pool).QueryRow(ctx, query, userID, status)
	user, err := scanUser(row)
	if err != nil {
		return nil, mapUserError("UpdateStatus", err)
	}
	return user, nil
}

func (r *userPostgresRepo) countUsers(ctx context.Context, filter repository.UserFilter) (int64, error) {
	query := `SELECT COUNT(*) FROM users WHERE 1=1`
	args := make([]any, 0, 1)

	if filter.Status != nil {
		query += " AND status = $1"
		args = append(args, *filter.Status)
	}

	var total int64
	if err := extractQuerier(ctx, r.pool).QueryRow(ctx, query, args...).Scan(&total); err != nil {
		return 0, fmt.Errorf("userPostgresRepo.countUsers: %w", err)
	}
	return total, nil
}

func (r *userPostgresRepo) UpdatePassword(ctx context.Context, userID uuid.UUID, passwordHash string) error {
	tag, err := extractQuerier(ctx, r.pool).Exec(ctx, `
		UPDATE users
		SET password_hash = $2, updated_at = NOW()
		WHERE id = $1
	`, userID, passwordHash)
	if err != nil {
		return fmt.Errorf("userPostgresRepo.UpdatePassword: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return apperrors.NewNotFound("user not found")
	}
	return nil
}

func (r *userPostgresRepo) UpdateLastLogin(ctx context.Context, userID uuid.UUID) error {
	tag, err := extractQuerier(ctx, r.pool).Exec(ctx, `
		UPDATE users
		SET last_login_at = NOW(), updated_at = NOW()
		WHERE id = $1
	`, userID)
	if err != nil {
		return fmt.Errorf("userPostgresRepo.UpdateLastLogin: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return apperrors.NewNotFound("user not found")
	}
	return nil
}

func (r *userPostgresRepo) findOne(ctx context.Context, query string, arg any) (*entity.User, error) {
	row := extractQuerier(ctx, r.pool).QueryRow(ctx, query, arg)
	user, err := scanUser(row)
	if err != nil {
		return nil, mapUserError("findOne", err)
	}
	return user, nil
}

func scanUser(row pgx.Row) (*entity.User, error) {
	var user entity.User
	var phone, avatarURL *string

	err := row.Scan(
		&user.ID,
		&user.Username,
		&user.Email,
		&user.PasswordHash,
		&phone,
		&user.FullName,
		&avatarURL,
		&user.Status,
		&user.LastLoginAt,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	if phone != nil {
		user.Phone = *phone
	}
	if avatarURL != nil {
		user.AvatarURL = *avatarURL
	}

	return &user, nil
}

func mapUserError(method string, err error) error {
	if errors.Is(err, pgx.ErrNoRows) {
		return apperrors.NewNotFound("user not found")
	}
	return fmt.Errorf("userPostgresRepo.%s: %w", method, err)
}
