package persistence

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	apperrors "github.com/novacommerce/pkg/errors"
	pkglogger "github.com/novacommerce/pkg/logger"
	"github.com/novacommerce/services/catalog-service/internal/domain"
	"github.com/novacommerce/services/catalog-service/internal/domain/repository"
)

const categoryColumns = `id, parent_id, name, slug, description, image_url, sort_order, is_active, created_at, updated_at`

type postgresCategoryRepository struct {
	db  queryLogger
	log *pkglogger.Logger
}

// NewCategoryPostgresRepository creates a PostgreSQL-backed CategoryRepository.
func NewCategoryPostgresRepository(pool *pgxpool.Pool, log *pkglogger.Logger) repository.CategoryRepository {
	return &postgresCategoryRepository{
		db:  newQueryLogger(pool, log, "categories"),
		log: log,
	}
}

// NewPostgresCategoryRepository is an alias for NewCategoryPostgresRepository.
func NewPostgresCategoryRepository(pool *pgxpool.Pool, log *pkglogger.Logger) repository.CategoryRepository {
	return NewCategoryPostgresRepository(pool, log)
}

func (r *postgresCategoryRepository) GetAll(ctx context.Context) ([]*domain.Category, error) {
	query := `
		SELECT ` + categoryColumns + `
		FROM categories
		WHERE deleted_at IS NULL
		ORDER BY sort_order ASC`

	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, r.mapError("GetAll", err)
	}
	defer rows.Close()

	categories := make([]*domain.Category, 0)
	for rows.Next() {
		category, err := scanCategory(rows)
		if err != nil {
			return nil, r.mapError("GetAll", err)
		}
		categories = append(categories, category)
	}
	if err := rows.Err(); err != nil {
		return nil, r.mapError("GetAll", err)
	}

	return categories, nil
}

func (r *postgresCategoryRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.Category, error) {
	query := `
		SELECT ` + categoryColumns + `
		FROM categories
		WHERE id = $1 AND deleted_at IS NULL
		LIMIT 1`

	row := r.db.QueryRow(ctx, query, id)
	category, err := scanCategory(row)
	if err != nil {
		return nil, r.mapError("GetByID", err)
	}
	return category, nil
}

func (r *postgresCategoryRepository) GetDescendantIDs(ctx context.Context, id uuid.UUID) ([]uuid.UUID, error) {
	query := `
		WITH RECURSIVE descendants AS (
			SELECT id FROM categories WHERE parent_id = $1 AND deleted_at IS NULL
			UNION ALL
			SELECT c.id FROM categories c
			INNER JOIN descendants d ON c.parent_id = d.id
			WHERE c.deleted_at IS NULL
		)
		SELECT id FROM descendants`

	rows, err := r.db.Query(ctx, query, id)
	if err != nil {
		return nil, r.mapError("GetDescendantIDs", err)
	}
	defer rows.Close()

	ids := make([]uuid.UUID, 0)
	for rows.Next() {
		var descendantID uuid.UUID
		if err := rows.Scan(&descendantID); err != nil {
			return nil, r.mapError("GetDescendantIDs", err)
		}
		ids = append(ids, descendantID)
	}
	if err := rows.Err(); err != nil {
		return nil, r.mapError("GetDescendantIDs", err)
	}

	return ids, nil
}

func (r *postgresCategoryRepository) Create(ctx context.Context, category *domain.Category) error {
	if category.ID == uuid.Nil {
		category.ID = uuid.New()
	}

	createdAt := category.CreatedAt
	if createdAt.IsZero() {
		createdAt = time.Now().UTC()
	}
	updatedAt := category.UpdatedAt
	if updatedAt.IsZero() {
		updatedAt = createdAt
	}

	query := `
		INSERT INTO categories (
			id, parent_id, name, slug, description, image_url, sort_order, is_active, created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		RETURNING id, created_at, updated_at`

	err := r.db.QueryRow(ctx, query,
		category.ID,
		category.ParentID,
		category.Name,
		category.Slug,
		category.Description,
		category.ImageURL,
		category.SortOrder,
		category.IsActive,
		createdAt,
		updatedAt,
	).Scan(&category.ID, &category.CreatedAt, &category.UpdatedAt)
	if err != nil {
		return r.mapError("Create", err)
	}
	return nil
}

func (r *postgresCategoryRepository) Update(ctx context.Context, category *domain.Category) error {
	query := `
		UPDATE categories
		SET name = $2,
		    slug = $3,
		    description = $4,
		    image_url = $5,
		    sort_order = $6,
		    is_active = $7,
		    updated_at = NOW()
		WHERE id = $1 AND deleted_at IS NULL
		RETURNING updated_at`

	err := r.db.QueryRow(ctx, query,
		category.ID,
		category.Name,
		category.Slug,
		category.Description,
		category.ImageURL,
		category.SortOrder,
		category.IsActive,
	).Scan(&category.UpdatedAt)
	if err != nil {
		return r.mapError("Update", err)
	}
	return nil
}

func (r *postgresCategoryRepository) ExistsBySlug(ctx context.Context, slug string) (bool, error) {
	var exists bool
	err := r.db.QueryRow(ctx, `
		SELECT EXISTS(
			SELECT 1 FROM categories WHERE slug = $1 AND deleted_at IS NULL
		)
	`, slug).Scan(&exists)
	if err != nil {
		return false, r.mapError("ExistsBySlug", err)
	}
	return exists, nil
}

func scanCategory(row pgx.Row) (*domain.Category, error) {
	var category domain.Category
	err := row.Scan(
		&category.ID,
		&category.ParentID,
		&category.Name,
		&category.Slug,
		&category.Description,
		&category.ImageURL,
		&category.SortOrder,
		&category.IsActive,
		&category.CreatedAt,
		&category.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &category, nil
}

func (r *postgresCategoryRepository) mapError(method string, err error) error {
	if err == nil {
		return nil
	}
	if errors.Is(err, pgx.ErrNoRows) {
		return apperrors.NewNotFound("category not found")
	}
	if dup := mapUniqueViolation(err, "slug", apperrors.NewConflict("slug already exists")); dup != nil {
		return dup
	}
	if r.log != nil {
		r.log.Error().
			Err(err).
			Str("method", method).
			Str("table", "categories").
			Msg("database error")
	}
	return fmt.Errorf("category repository %s: %w", method, err)
}
