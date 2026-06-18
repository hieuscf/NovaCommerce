package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/novacommerce/services/catalog-service/internal/domain/entity"
)

// InventoryAdjustment describes a single stock change for bulk operations.
type InventoryAdjustment struct {
	VariantID         uuid.UUID
	WarehouseID       uuid.UUID
	QuantityAvailable int
	LowStockThreshold *int
}

// InventoryRepository persists and retrieves inventory records.
type InventoryRepository interface {
	Create(ctx context.Context, inventory *entity.Inventory) error
	Update(ctx context.Context, inventory *entity.Inventory) error
	FindByID(ctx context.Context, id uuid.UUID) (*entity.Inventory, error)
	FindByVariantAndWarehouse(ctx context.Context, variantID, warehouseID uuid.UUID) (*entity.Inventory, error)
	FindByVariantID(ctx context.Context, variantID uuid.UUID) ([]*entity.Inventory, error)
	FindLowStock(ctx context.Context, sellerID uuid.UUID) ([]*entity.Inventory, error)
	Reserve(ctx context.Context, variantID, warehouseID uuid.UUID, quantity int) error
	Release(ctx context.Context, variantID, warehouseID uuid.UUID, quantity int) error
	Deduct(ctx context.Context, variantID, warehouseID uuid.UUID, quantity int) error
	BulkAdjust(ctx context.Context, adjustments []InventoryAdjustment) error
}
