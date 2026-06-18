package persistence

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	pkglogger "github.com/novacommerce/pkg/logger"
	"github.com/novacommerce/services/catalog-service/internal/domain/entity"
	"github.com/novacommerce/services/catalog-service/internal/domain/repository"
)

type variantAttributeValuePostgresRepo struct {
	pool *pgxpool.Pool
	db   queryLogger
}

// NewVariantAttributeValuePostgresRepo creates a PostgreSQL-backed VariantAttributeValueRepository.
func NewVariantAttributeValuePostgresRepo(pool *pgxpool.Pool, log *pkglogger.Logger) repository.VariantAttributeValueRepository {
	return &variantAttributeValuePostgresRepo{
		pool: pool,
		db:   newQueryLogger(pool, log, "variant_attribute_values"),
	}
}

func (r *variantAttributeValuePostgresRepo) Create(ctx context.Context, link *entity.VariantAttributeValue) error {
	if link.ID == uuid.Nil {
		link.ID = uuid.New()
	}

	query := `
		INSERT INTO variant_attribute_values (id, variant_id, attribute_value_id)
		VALUES ($1, $2, $3)
		RETURNING id, variant_id, attribute_value_id`

	row := r.db.QueryRow(ctx, query, link.ID, link.VariantID, link.AttributeValueID)
	if err := row.Scan(&link.ID, &link.VariantID, &link.AttributeValueID); err != nil {
		return fmt.Errorf("variant attribute value repository: %w", err)
	}
	return nil
}
