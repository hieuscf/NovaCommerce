package postgres

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/novacommerce/identity-service/internal/domain/entity"
	"github.com/novacommerce/identity-service/internal/domain/repository"
	apperrors "github.com/novacommerce/pkg/errors"
)

const roleColumns = `id, name, display_name, description, is_system, created_at, updated_at`

type rolePostgresRepo struct {
	pool *pgxpool.Pool
}

// NewRolePostgresRepo creates a PostgreSQL-backed RoleRepository.
func NewRolePostgresRepo(pool *pgxpool.Pool) repository.RoleRepository {
	return &rolePostgresRepo{pool: pool}
}

func (r *rolePostgresRepo) Create(ctx context.Context, role *entity.Role) error {
	query := `
		INSERT INTO roles (id, name, display_name, description, is_system, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING ` + roleColumns

	row := extractQuerier(ctx, r.pool).QueryRow(ctx, query,
		role.ID,
		role.Name,
		role.DisplayName,
		role.Description,
		role.IsSystem,
		role.CreatedAt,
		role.UpdatedAt,
	)

	created, err := scanRole(row)
	if err != nil {
		return mapRoleError("Create", err)
	}

	*role = *created
	return nil
}

func (r *rolePostgresRepo) FindByID(ctx context.Context, id uuid.UUID) (*entity.Role, error) {
	query := `SELECT ` + roleColumns + ` FROM roles WHERE id = $1 LIMIT 1`
	return r.findOne(ctx, query, id)
}

func (r *rolePostgresRepo) FindByName(ctx context.Context, name string) (*entity.Role, error) {
	query := `SELECT ` + roleColumns + ` FROM roles WHERE name = $1 LIMIT 1`
	return r.findOne(ctx, query, name)
}

func (r *rolePostgresRepo) List(ctx context.Context) ([]*entity.Role, error) {
	query := `SELECT ` + roleColumns + ` FROM roles ORDER BY name ASC`

	rows, err := extractQuerier(ctx, r.pool).Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("rolePostgresRepo.List: %w", err)
	}
	defer rows.Close()

	roles := make([]*entity.Role, 0)
	for rows.Next() {
		role, err := scanRole(rows)
		if err != nil {
			return nil, fmt.Errorf("rolePostgresRepo.List scan: %w", err)
		}
		roles = append(roles, role)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("rolePostgresRepo.List rows: %w", err)
	}

	return roles, nil
}

func (r *rolePostgresRepo) GetUserRoles(ctx context.Context, userID uuid.UUID) ([]*entity.Role, error) {
	query := `
		SELECT ` + roleColumns + `
		FROM roles r
		INNER JOIN user_roles ur ON ur.role_id = r.id
		WHERE ur.user_id = $1
		ORDER BY r.name ASC`

	rows, err := extractQuerier(ctx, r.pool).Query(ctx, query, userID)
	if err != nil {
		return nil, fmt.Errorf("rolePostgresRepo.GetUserRoles: %w", err)
	}
	defer rows.Close()

	roles := make([]*entity.Role, 0)
	for rows.Next() {
		role, err := scanRole(rows)
		if err != nil {
			return nil, fmt.Errorf("rolePostgresRepo.GetUserRoles scan: %w", err)
		}
		roles = append(roles, role)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("rolePostgresRepo.GetUserRoles rows: %w", err)
	}

	return roles, nil
}

func (r *rolePostgresRepo) AssignRole(ctx context.Context, userID, roleID uuid.UUID) error {
	tag, err := extractQuerier(ctx, r.pool).Exec(ctx, `
		INSERT INTO user_roles (user_id, role_id)
		VALUES ($1, $2)
		ON CONFLICT (user_id, role_id) DO NOTHING
	`, userID, roleID)
	if err != nil {
		return mapRoleAssignmentError(err)
	}
	if tag.RowsAffected() == 0 {
		exists, err := r.roleAssigned(ctx, userID, roleID)
		if err != nil {
			return err
		}
		if exists {
			return apperrors.NewConflict("role already assigned to user")
		}
		return apperrors.NewNotFound("user or role not found")
	}
	return nil
}

func (r *rolePostgresRepo) RevokeRole(ctx context.Context, userID, roleID uuid.UUID) error {
	tag, err := extractQuerier(ctx, r.pool).Exec(ctx, `
		DELETE FROM user_roles
		WHERE user_id = $1 AND role_id = $2
	`, userID, roleID)
	if err != nil {
		return fmt.Errorf("rolePostgresRepo.RevokeRole: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return apperrors.NewNotFound("role assignment not found")
	}
	return nil
}

func (r *rolePostgresRepo) RoleExists(ctx context.Context, roleID uuid.UUID) (bool, error) {
	var exists bool
	err := extractQuerier(ctx, r.pool).QueryRow(ctx, `
		SELECT EXISTS(SELECT 1 FROM roles WHERE id = $1)
	`, roleID).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("rolePostgresRepo.RoleExists: %w", err)
	}
	return exists, nil
}

func (r *rolePostgresRepo) CountUsersWithRole(ctx context.Context, roleID uuid.UUID) (int, error) {
	var count int
	err := extractQuerier(ctx, r.pool).QueryRow(ctx, `
		SELECT COUNT(DISTINCT user_id) FROM user_roles WHERE role_id = $1
	`, roleID).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("rolePostgresRepo.CountUsersWithRole: %w", err)
	}
	return count, nil
}

func (r *rolePostgresRepo) roleAssigned(ctx context.Context, userID, roleID uuid.UUID) (bool, error) {
	var exists bool
	err := extractQuerier(ctx, r.pool).QueryRow(ctx, `
		SELECT EXISTS(
			SELECT 1 FROM user_roles WHERE user_id = $1 AND role_id = $2
		)
	`, userID, roleID).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("rolePostgresRepo.roleAssigned: %w", err)
	}
	return exists, nil
}

func (r *rolePostgresRepo) findOne(ctx context.Context, query string, arg any) (*entity.Role, error) {
	row := extractQuerier(ctx, r.pool).QueryRow(ctx, query, arg)
	role, err := scanRole(row)
	if err != nil {
		return nil, mapRoleError("findOne", err)
	}
	return role, nil
}

func scanRole(row pgx.Row) (*entity.Role, error) {
	var role entity.Role
	err := row.Scan(
		&role.ID,
		&role.Name,
		&role.DisplayName,
		&role.Description,
		&role.IsSystem,
		&role.CreatedAt,
		&role.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &role, nil
}

func mapRoleError(method string, err error) error {
	if errors.Is(err, pgx.ErrNoRows) {
		return apperrors.NewNotFound("role not found")
	}
	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) && pgErr.Code == "23505" {
		return apperrors.NewConflict("role already exists")
	}
	return fmt.Errorf("rolePostgresRepo.%s: %w", method, err)
}

func mapRoleAssignmentError(err error) error {
	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) && pgErr.Code == "23503" {
		return apperrors.NewNotFound("user or role not found")
	}
	return fmt.Errorf("rolePostgresRepo.AssignRole: %w", err)
}
