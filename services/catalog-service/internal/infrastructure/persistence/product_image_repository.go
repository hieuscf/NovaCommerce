package persistence

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	apperrors "github.com/novacommerce/pkg/errors"
	pkglogger "github.com/novacommerce/pkg/logger"
	"github.com/novacommerce/services/catalog-service/internal/domain/entity"
	"github.com/novacommerce/services/catalog-service/internal/domain/repository"
)

type productImagePostgresRepo struct {
	db queryLogger
}

func newProductImagePostgresRepo(pool *pgxpool.Pool, log *pkglogger.Logger) *productImagePostgresRepo {
	return &productImagePostgresRepo{db: newQueryLogger(pool, log, "product_images")}
}

// NewProductImagePostgresRepo creates a PostgreSQL-backed ProductImageRepository.
func NewProductImagePostgresRepo(pool *pgxpool.Pool, log *pkglogger.Logger) repository.ProductImageRepository {
	return newProductImagePostgresRepo(pool, log)
}

func (r *productImagePostgresRepo) Create(ctx context.Context, image *entity.ProductImage) error {
	if image.Position < 0 {
		return apperrors.NewValidation("image position must be non-negative", nil)
	}
	if image.ID == uuid.Nil {
		image.ID = uuid.New()
	}

	query := `
		INSERT INTO product_images (id, product_id, url, alt_text, position, created_at)
		VALUES ($1, $2, $3, $4, $5, COALESCE($6, NOW()))
		RETURNING ` + imageColumns

	createdAt := image.CreatedAt
	if createdAt.IsZero() {
		createdAt = time.Now().UTC()
	}

	row := r.db.QueryRow(ctx, query,
		image.ID,
		image.ProductID,
		image.URL,
		image.AltText,
		image.Position,
		createdAt,
	)

	created, err := scanImage(row)
	if err != nil {
		return mapImageError(err)
	}
	*image = *created
	return nil
}

func (r *productImagePostgresRepo) Delete(ctx context.Context, imageID uuid.UUID) error {
	tag, err := r.db.Exec(ctx, `DELETE FROM product_images WHERE id = $1`, imageID)
	if err != nil {
		return mapImageError(err)
	}
	if tag.RowsAffected() == 0 {
		return entity.ErrProductNotFound
	}
	return nil
}

func (r *productImagePostgresRepo) FindByProductID(ctx context.Context, productID uuid.UUID) ([]*entity.ProductImage, error) {
	return r.findByProductKey(ctx, true, productID)
}

func (r *productImagePostgresRepo) CountByProductID(ctx context.Context, productID uuid.UUID) (int, error) {
	var count int
	err := r.db.QueryRow(ctx, `SELECT COUNT(*) FROM product_images WHERE product_id = $1`, productID).Scan(&count)
	if err != nil {
		return 0, mapImageError(err)
	}
	return count, nil
}

func (r *productImagePostgresRepo) findByProductKey(ctx context.Context, byProductID bool, key any) ([]*entity.ProductImage, error) {
	predicate := "product_id = $1"
	fromClause := "FROM product_images"
	if !byProductID {
		predicate = "p.slug = $1 AND p.deleted_at IS NULL"
		fromClause = `FROM product_images i
			INNER JOIN products p ON p.id = i.product_id`
	}

	selectCols := imageColumns
	if !byProductID {
		selectCols = "i.id, i.product_id, i.url, i.alt_text, i.position, i.created_at"
	}

	query := fmt.Sprintf(`
		SELECT %s
		%s
		WHERE %s
		ORDER BY %s ASC`, selectCols, fromClause, predicate, orderByColumn(byProductID))

	rows, err := r.db.Query(ctx, query, key)
	if err != nil {
		return nil, mapImageError(err)
	}
	defer rows.Close()

	var images []*entity.ProductImage
	for rows.Next() {
		image, err := scanImage(rows)
		if err != nil {
			return nil, mapImageError(err)
		}
		images = append(images, image)
	}
	if err := rows.Err(); err != nil {
		return nil, mapImageError(err)
	}
	return images, nil
}

func scanImage(row pgx.Row) (*entity.ProductImage, error) {
	var image entity.ProductImage
	err := row.Scan(
		&image.ID,
		&image.ProductID,
		&image.URL,
		&image.AltText,
		&image.Position,
		&image.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &image, nil
}

func orderByColumn(byProductID bool) string {
	if byProductID {
		return "position"
	}
	return "i.position"
}
