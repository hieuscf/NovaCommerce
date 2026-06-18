package persistence

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	pkglogger "github.com/novacommerce/pkg/logger"
	"github.com/novacommerce/services/catalog-service/internal/domain/entity"
	"github.com/novacommerce/services/catalog-service/internal/domain/repository"
)

const variantColumns = `id, product_id, sku, price, compare_price, weight, status, created_at, updated_at`

type productVariantPostgresRepo struct {
	db queryLogger
}

func newProductVariantPostgresRepo(pool *pgxpool.Pool, log *pkglogger.Logger) *productVariantPostgresRepo {
	return &productVariantPostgresRepo{db: newQueryLogger(pool, log, "product_variants")}
}

// NewProductVariantPostgresRepo creates a PostgreSQL-backed ProductVariantRepository.
func NewProductVariantPostgresRepo(pool *pgxpool.Pool, log *pkglogger.Logger) repository.ProductVariantRepository {
	return newProductVariantPostgresRepo(pool, log)
}

func (r *productVariantPostgresRepo) Create(ctx context.Context, variant *entity.ProductVariant) error {
	if variant.ID == uuid.Nil {
		variant.ID = uuid.New()
	}
	if variant.Status == "" {
		variant.Status = entity.ProductStatusActive
	}

	query := `
		INSERT INTO product_variants (
			id, product_id, sku, price, compare_price, weight, status, created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8, NOW()), COALESCE($9, NOW()))
		RETURNING ` + variantColumns

	createdAt := variant.CreatedAt
	if createdAt.IsZero() {
		createdAt = time.Now().UTC()
	}
	updatedAt := variant.UpdatedAt
	if updatedAt.IsZero() {
		updatedAt = createdAt
	}

	row := r.db.QueryRow(ctx, query,
		variant.ID,
		variant.ProductID,
		variant.SKU,
		variant.Price,
		variant.ComparePrice,
		variant.Weight,
		variant.Status,
		createdAt,
		updatedAt,
	)

	created, err := scanVariant(row)
	if err != nil {
		return mapVariantError(err)
	}
	*variant = *created
	return nil
}

func (r *productVariantPostgresRepo) Update(ctx context.Context, variant *entity.ProductVariant) error {
	query := `
		UPDATE product_variants
		SET price = $2,
		    compare_price = $3,
		    weight = $4,
		    status = $5,
		    updated_at = NOW()
		WHERE id = $1
		RETURNING ` + variantColumns

	row := r.db.QueryRow(ctx, query,
		variant.ID,
		variant.Price,
		variant.ComparePrice,
		variant.Weight,
		variant.Status,
	)

	updated, err := scanVariant(row)
	if err != nil {
		return mapVariantError(err)
	}
	*variant = *updated
	return nil
}

func (r *productVariantPostgresRepo) Delete(ctx context.Context, variantID uuid.UUID) error {
	tag, err := r.db.Exec(ctx, `DELETE FROM product_variants WHERE id = $1`, variantID)
	if err != nil {
		return mapVariantError(err)
	}
	if tag.RowsAffected() == 0 {
		return entity.ErrVariantNotFound
	}
	return nil
}

func (r *productVariantPostgresRepo) FindByProductID(ctx context.Context, productID uuid.UUID) ([]*entity.ProductVariant, error) {
	return r.findWithAttributes(ctx, true, productID)
}

func (r *productVariantPostgresRepo) FindByID(ctx context.Context, id uuid.UUID) (*entity.ProductVariant, error) {
	variants, err := r.queryVariantsWithAttributes(ctx, "v.id = $1", id)
	if err != nil {
		return nil, err
	}
	if len(variants) == 0 {
		return nil, entity.ErrVariantNotFound
	}
	return variants[0], nil
}

func (r *productVariantPostgresRepo) findWithAttributes(ctx context.Context, byProductID bool, key any) ([]*entity.ProductVariant, error) {
	if byProductID {
		return r.queryVariantsWithAttributes(ctx, "v.product_id = $1", key)
	}
	return r.queryVariantsWithAttributes(ctx, "p.slug = $1 AND p.deleted_at IS NULL", key)
}

func (r *productVariantPostgresRepo) queryVariantsWithAttributes(ctx context.Context, predicate string, arg any) ([]*entity.ProductVariant, error) {
	fromClause := `
		FROM product_variants v
		LEFT JOIN variant_attribute_values vav ON vav.variant_id = v.id
		LEFT JOIN attribute_values av ON av.id = vav.attribute_value_id
		LEFT JOIN attributes a ON a.id = av.attribute_id`

	if predicate == "p.slug = $1 AND p.deleted_at IS NULL" {
		fromClause = `
		FROM product_variants v
		INNER JOIN products p ON p.id = v.product_id
		LEFT JOIN variant_attribute_values vav ON vav.variant_id = v.id
		LEFT JOIN attribute_values av ON av.id = vav.attribute_value_id
		LEFT JOIN attributes a ON a.id = av.attribute_id`
	}

	query := fmt.Sprintf(`
		SELECT %s
		%s
		WHERE %s
		ORDER BY v.created_at ASC, a.name ASC NULLS LAST`, variantWithAttributesSelect, fromClause, predicate)

	rows, err := r.db.Query(ctx, query, arg)
	if err != nil {
		return nil, mapVariantError(err)
	}
	defer rows.Close()

	return collectVariantsWithAttributes(rows)
}

func collectVariantsWithAttributes(rows pgx.Rows) ([]*entity.ProductVariant, error) {
	byID := make(map[uuid.UUID]*entity.ProductVariant)
	order := make([]*entity.ProductVariant, 0)

	for rows.Next() {
		var variant entity.ProductVariant
		var attributeID *uuid.UUID
		var attributeName *string
		var valueID *uuid.UUID
		var value *string

		if err := rows.Scan(
			&variant.ID,
			&variant.ProductID,
			&variant.SKU,
			&variant.Price,
			&variant.ComparePrice,
			&variant.Weight,
			&variant.Status,
			&variant.CreatedAt,
			&variant.UpdatedAt,
			&attributeID,
			&attributeName,
			&valueID,
			&value,
		); err != nil {
			return nil, mapVariantError(err)
		}

		existing, ok := byID[variant.ID]
		if !ok {
			copyVariant := variant
			copyVariant.Attributes = []*entity.VariantAttribute{}
			byID[variant.ID] = &copyVariant
			order = append(order, &copyVariant)
			existing = &copyVariant
		}

		if attributeID != nil && valueID != nil && attributeName != nil && value != nil {
			existing.Attributes = append(existing.Attributes, &entity.VariantAttribute{
				AttributeID:   *attributeID,
				AttributeName: *attributeName,
				ValueID:       *valueID,
				Value:         *value,
			})
		}
	}

	if err := rows.Err(); err != nil {
		return nil, mapVariantError(err)
	}

	return order, nil
}

func scanVariant(row pgx.Row) (*entity.ProductVariant, error) {
	var variant entity.ProductVariant
	err := row.Scan(
		&variant.ID,
		&variant.ProductID,
		&variant.SKU,
		&variant.Price,
		&variant.ComparePrice,
		&variant.Weight,
		&variant.Status,
		&variant.CreatedAt,
		&variant.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &variant, nil
}
