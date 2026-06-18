package persistence

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/sync/errgroup"

	"github.com/novacommerce/pkg/pagination"
	pkglogger "github.com/novacommerce/pkg/logger"
	"github.com/novacommerce/services/catalog-service/internal/domain/entity"
	"github.com/novacommerce/services/catalog-service/internal/domain/repository"
)

const productColumns = `id, seller_id, category_id, brand_id, name, slug, description, status, created_at, updated_at, deleted_at`

const variantWithAttributesSelect = `
	v.id, v.product_id, v.sku, v.price, v.compare_price, v.weight, v.status, v.created_at, v.updated_at,
	a.id AS attribute_id, a.name AS attribute_name,
	av.id AS value_id, av.value AS attribute_value`

const imageColumns = `id, product_id, url, alt_text, position, created_at`

type productPostgresRepo struct {
	db     queryLogger
	variants *productVariantPostgresRepo
	images   *productImagePostgresRepo
}

// NewProductPostgresRepo creates a PostgreSQL-backed ProductRepository.
func NewProductPostgresRepo(pool *pgxpool.Pool, log *pkglogger.Logger) repository.ProductRepository {
	return &productPostgresRepo{
		db:       newQueryLogger(pool, log, "products"),
		variants: newProductVariantPostgresRepo(pool, log),
		images:   newProductImagePostgresRepo(pool, log),
	}
}

func (r *productPostgresRepo) Create(ctx context.Context, product *entity.Product) error {
	if product.ID == uuid.Nil {
		product.ID = uuid.New()
	}
	if product.Slug == "" {
		product.Slug = generateProductSlug(product.Name, product.ID)
	}
	if product.Status == "" {
		product.Status = entity.ProductStatusDraft
	}

	query := `
		INSERT INTO products (
			id, seller_id, category_id, brand_id, name, slug, description, status, created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, COALESCE($9, NOW()), COALESCE($10, NOW()))
		RETURNING ` + productColumns

	createdAt := product.CreatedAt
	if createdAt.IsZero() {
		createdAt = time.Now().UTC()
	}
	updatedAt := product.UpdatedAt
	if updatedAt.IsZero() {
		updatedAt = createdAt
	}

	row := r.db.QueryRow(ctx, query,
		product.ID,
		product.SellerID,
		product.CategoryID,
		product.BrandID,
		product.Name,
		product.Slug,
		product.Description,
		product.Status,
		createdAt,
		updatedAt,
	)

	created, err := scanProduct(row)
	if err != nil {
		return mapProductError(err)
	}
	*product = *created
	return nil
}

func (r *productPostgresRepo) Update(ctx context.Context, product *entity.Product) error {
	setClauses := []string{"updated_at = NOW()"}
	args := []any{product.ID}
	argPos := 2

	if product.Name != "" {
		setClauses = append(setClauses, fmt.Sprintf("name = $%d", argPos))
		args = append(args, product.Name)
		argPos++
	}
	if product.Slug != "" {
		setClauses = append(setClauses, fmt.Sprintf("slug = $%d", argPos))
		args = append(args, product.Slug)
		argPos++
	}
	if product.Description != "" {
		setClauses = append(setClauses, fmt.Sprintf("description = $%d", argPos))
		args = append(args, product.Description)
		argPos++
	}
	if product.Status != "" {
		setClauses = append(setClauses, fmt.Sprintf("status = $%d", argPos))
		args = append(args, product.Status)
		argPos++
	}
	if product.CategoryID != uuid.Nil {
		setClauses = append(setClauses, fmt.Sprintf("category_id = $%d", argPos))
		args = append(args, product.CategoryID)
		argPos++
	}
	if product.BrandID != nil {
		setClauses = append(setClauses, fmt.Sprintf("brand_id = $%d", argPos))
		args = append(args, *product.BrandID)
	}

	query := fmt.Sprintf(`
		UPDATE products
		SET %s
		WHERE id = $1 AND deleted_at IS NULL
		RETURNING %s`, strings.Join(setClauses, ", "), productColumns)

	row := r.db.QueryRow(ctx, query, args...)
	updated, err := scanProduct(row)
	if err != nil {
		return mapProductError(err)
	}
	*product = *updated
	return nil
}

func (r *productPostgresRepo) Archive(ctx context.Context, id uuid.UUID) error {
	tag, err := r.db.Exec(ctx, `
		UPDATE products
		SET status = $2, deleted_at = NOW(), updated_at = NOW()
		WHERE id = $1 AND deleted_at IS NULL`,
		id, entity.ProductStatusArchived,
	)
	if err != nil {
		return mapProductError(err)
	}
	if tag.RowsAffected() == 0 {
		return entity.ErrProductNotFound
	}
	return nil
}

func (r *productPostgresRepo) FindByID(ctx context.Context, id uuid.UUID) (*entity.Product, error) {
	return r.loadProductGraph(ctx, true, id)
}

func (r *productPostgresRepo) FindBySlug(ctx context.Context, slug string) (*entity.Product, error) {
	return r.loadProductGraph(ctx, false, slug)
}

func (r *productPostgresRepo) loadProductGraph(ctx context.Context, byID bool, key any) (*entity.Product, error) {
	var product *entity.Product
	var variants []*entity.ProductVariant
	var images []*entity.ProductImage

	g, gctx := errgroup.WithContext(ctx)

	g.Go(func() error {
		predicate := "slug = $1"
		if byID {
			predicate = "id = $1"
		}
		query := fmt.Sprintf(`
			SELECT %s
			FROM products
			WHERE %s AND deleted_at IS NULL
			LIMIT 1`, productColumns, predicate)

		row := r.db.QueryRow(gctx, query, key)
		p, err := scanProduct(row)
		if err != nil {
			return mapProductError(err)
		}
		product = p
		return nil
	})

	g.Go(func() error {
		v, err := r.variants.findWithAttributes(gctx, byID, key)
		if err != nil {
			return err
		}
		variants = v
		return nil
	})

	g.Go(func() error {
		i, err := r.images.findByProductKey(gctx, byID, key)
		if err != nil {
			return err
		}
		images = i
		return nil
	})

	if err := g.Wait(); err != nil {
		return nil, err
	}

	product.Variants = variants
	product.Images = images
	return product, nil
}

func (r *productPostgresRepo) List(
	ctx context.Context,
	filter repository.ProductFilter,
	page pagination.CursorParams,
) ([]*entity.Product, int64, error) {
	limit := page.Limit
	if limit <= 0 {
		limit = 20
	}
	if limit > 100 {
		limit = 100
	}

	where, args := buildProductFilter(filter)
	argPos := len(args) + 1

	if page.Cursor != "" {
		cursorID, cursorTime, err := pagination.DecodeCursor(page.Cursor)
		if err != nil {
			return nil, 0, fmt.Errorf("product repository: invalid cursor: %w", err)
		}
		cursorUUID, err := uuid.Parse(cursorID)
		if err != nil {
			return nil, 0, fmt.Errorf("product repository: invalid cursor id: %w", err)
		}
		where = append(where, fmt.Sprintf("(p.created_at, p.id) < ($%d, $%d)", argPos, argPos+1))
		args = append(args, cursorTime, cursorUUID)
		argPos += 2
	}

	whereSQL := "p.deleted_at IS NULL"
	if len(where) > 0 {
		whereSQL += " AND " + strings.Join(where, " AND ")
	}

	query := fmt.Sprintf(`
		SELECT p.id, p.seller_id, p.category_id, p.brand_id, p.name, p.slug, p.description,
		       p.status, p.created_at, p.updated_at, p.deleted_at,
		       COUNT(*) OVER() AS total_count
		FROM products p
		WHERE %s
		ORDER BY p.created_at DESC, p.id DESC
		LIMIT $%d`, whereSQL, argPos)

	args = append(args, limit)

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, 0, mapProductError(err)
	}
	defer rows.Close()

	var products = make([]*entity.Product, 0)
	var total int64

	for rows.Next() {
		product, rowTotal, err := scanProductWithTotal(rows)
		if err != nil {
			return nil, 0, mapProductError(err)
		}
		if total == 0 {
			total = rowTotal
		}
		products = append(products, product)
	}
	if err := rows.Err(); err != nil {
		return nil, 0, mapProductError(err)
	}

	return products, total, nil
}

func buildProductFilter(filter repository.ProductFilter) ([]string, []any) {
	var where []string
	var args []any
	argPos := 1

	if filter.CategoryID != nil {
		where = append(where, fmt.Sprintf("p.category_id = $%d", argPos))
		args = append(args, *filter.CategoryID)
		argPos++
	}
	if filter.BrandID != nil {
		where = append(where, fmt.Sprintf("p.brand_id = $%d", argPos))
		args = append(args, *filter.BrandID)
		argPos++
	}
	if filter.SellerID != nil {
		where = append(where, fmt.Sprintf("p.seller_id = $%d", argPos))
		args = append(args, *filter.SellerID)
		argPos++
	}
	if filter.Status != nil {
		where = append(where, fmt.Sprintf("p.status = $%d", argPos))
		args = append(args, *filter.Status)
		argPos++
	}
	if filter.Search != "" {
		where = append(where, fmt.Sprintf("p.name ILIKE $%d", argPos))
		args = append(args, "%"+filter.Search+"%")
		argPos++
	}
	if filter.MinPrice != nil {
		where = append(where, fmt.Sprintf(`EXISTS (
			SELECT 1 FROM product_variants pv
			WHERE pv.product_id = p.id AND pv.price >= $%d
		)`, argPos))
		args = append(args, *filter.MinPrice)
		argPos++
	}
	if filter.MaxPrice != nil {
		where = append(where, fmt.Sprintf(`EXISTS (
			SELECT 1 FROM product_variants pv
			WHERE pv.product_id = p.id AND pv.price <= $%d
		)`, argPos))
		args = append(args, *filter.MaxPrice)
	}

	return where, args
}

func scanProduct(row pgx.Row) (*entity.Product, error) {
	var product entity.Product
	err := row.Scan(
		&product.ID,
		&product.SellerID,
		&product.CategoryID,
		&product.BrandID,
		&product.Name,
		&product.Slug,
		&product.Description,
		&product.Status,
		&product.CreatedAt,
		&product.UpdatedAt,
		&product.DeletedAt,
	)
	if err != nil {
		return nil, err
	}
	return &product, nil
}

func scanProductWithTotal(rows pgx.Rows) (*entity.Product, int64, error) {
	var product entity.Product
	var total int64
	err := rows.Scan(
		&product.ID,
		&product.SellerID,
		&product.CategoryID,
		&product.BrandID,
		&product.Name,
		&product.Slug,
		&product.Description,
		&product.Status,
		&product.CreatedAt,
		&product.UpdatedAt,
		&product.DeletedAt,
		&total,
	)
	if err != nil {
		return nil, 0, err
	}
	return &product, total, nil
}
