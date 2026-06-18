package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/novacommerce/services/catalog-service/internal/domain/entity"
)

// WarehouseRepository persists and retrieves warehouses.
type WarehouseRepository interface {
	Create(ctx context.Context, warehouse *entity.Warehouse) error
	Update(ctx context.Context, warehouse *entity.Warehouse) error
	FindByID(ctx context.Context, id uuid.UUID) (*entity.Warehouse, error)
	FindByCode(ctx context.Context, code string) (*entity.Warehouse, error)
	List(ctx context.Context, activeOnly bool) ([]*entity.Warehouse, error)
	ExistsByCode(ctx context.Context, code string) (bool, error)
}
