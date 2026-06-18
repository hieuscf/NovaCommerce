package repository

import (
	"context"

	"github.com/novacommerce/services/catalog-service/internal/domain/entity"
)

// VariantAttributeValueRepository links product variants to attribute values.
type VariantAttributeValueRepository interface {
	Create(ctx context.Context, link *entity.VariantAttributeValue) error
}
