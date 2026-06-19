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

const brandColumns = `id, name, slug, description, logo_url, is_active, created_at, updated_at`

type postgresBrandRepository struct {
	db  queryLogger
	log *pkglogger.Logger
}

// NewBrandPostgresRepository creates a PostgreSQL-backed BrandRepository.
func NewBrandPostgresRepository(pool *pgxpool.Pool, log *pkglogger.Logger) repository.BrandRepository {
	return &postgresBrandRepository{
		db:  newQueryLogger(pool, log, "brands"),
		log: log,
	}
}

func (r *postgresBrandRepository) GetAll(ctx context.Context, onlyActive bool) ([]*domain.Brand, error) {
	query := `
		SELECT ` + brandColumns + `
		FROM brands
		WHERE deleted_at IS NULL`
	if onlyActive {
		query += ` AND is_active = true`
	}

	query += ` ORDER BY name ASC`

	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, r.mapError("GetAll", err)
	}
	defer rows.Close()

	brands := make([]*domain.Brand, 0)
	for rows.Next() {
		brand, err := scanBrand(rows)
		if err != nil {
			return nil, r.mapError("GetAll", err)
		}
		brands = append(brands, brand)
	}
	if err := rows.Err(); err != nil {
		return nil, r.mapError("GetAll", err)
	}

	return brands, nil
}

func (r *postgresBrandRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.Brand, error) {
	query := `
		SELECT ` + brandColumns + `
		FROM brands
		WHERE id = $1 AND deleted_at IS NULL
		LIMIT 1`

	row := r.db.QueryRow(ctx, query, id)
	brand, err := scanBrand(row)
	if err != nil {
		return nil, r.mapError("GetByID", err)
	}
	return brand, nil
}

func (r *postgresBrandRepository) Create(ctx context.Context, brand *domain.Brand) error {
	if brand.ID == uuid.Nil {
		brand.ID = uuid.New()
	}

	createdAt := brand.CreatedAt
	if createdAt.IsZero() {
		createdAt = time.Now().UTC()
	}
	updatedAt := brand.UpdatedAt
	if updatedAt.IsZero() {
		updatedAt = createdAt
	}

	query := `
		INSERT INTO brands (
			id, name, slug, description, logo_url, is_active, created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id, created_at, updated_at`

	err := r.db.QueryRow(ctx, query,
		brand.ID,
		brand.Name,
		brand.Slug,
		brand.Description,
		brand.LogoURL,
		brand.IsActive,
		createdAt,
		updatedAt,
	).Scan(&brand.ID, &brand.CreatedAt, &brand.UpdatedAt)
	if err != nil {
		return r.mapError("Create", err)
	}
	return nil
}

func (r *postgresBrandRepository) Update(ctx context.Context, brand *domain.Brand) error {
	query := `
		UPDATE brands
		SET name = $2,
		    slug = $3,
		    description = $4,
		    logo_url = $5,
		    is_active = $6,
		    updated_at = NOW()
		WHERE id = $1 AND deleted_at IS NULL
		RETURNING updated_at`

	err := r.db.QueryRow(ctx, query,
		brand.ID,
		brand.Name,
		brand.Slug,
		brand.Description,
		brand.LogoURL,
		brand.IsActive,
	).Scan(&brand.UpdatedAt)
	if err != nil {
		return r.mapError("Update", err)
	}
	return nil
}

func (r *postgresBrandRepository) ExistsBySlug(ctx context.Context, slug string) (bool, error) {
	var exists bool
	err := r.db.QueryRow(ctx, `
		SELECT EXISTS(
			SELECT 1 FROM brands WHERE slug = $1 AND deleted_at IS NULL
		)
	`, slug).Scan(&exists)
	if err != nil {
		return false, r.mapError("ExistsBySlug", err)
	}
	return exists, nil
}

func scanBrand(row pgx.Row) (*domain.Brand, error) {
	var brand domain.Brand
	err := row.Scan(
		&brand.ID,
		&brand.Name,
		&brand.Slug,
		&brand.Description,
		&brand.LogoURL,
		&brand.IsActive,
		&brand.CreatedAt,
		&brand.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &brand, nil
}

func (r *postgresBrandRepository) mapError(method string, err error) error {
	if err == nil {
		return nil
	}
	if errors.Is(err, pgx.ErrNoRows) {
		return apperrors.NewNotFound("brand not found")
	}
	if dup := mapUniqueViolation(err, "slug", apperrors.NewConflict("slug already exists")); dup != nil {
		return dup
	}
	if r.log != nil {
		r.log.Error().
			Err(err).
			Str("method", method).
			Str("table", "brands").
			Msg("database error")
	}
	return fmt.Errorf("brand repository %s: %w", method, err)
}
