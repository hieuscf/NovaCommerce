package entity

import (
	"time"

	"github.com/google/uuid"
)

// Inventory maps to the inventory table.
type Inventory struct {
	ID                uuid.UUID `db:"id" json:"id"`
	VariantID         uuid.UUID `db:"variant_id" json:"variant_id"`
	WarehouseID       uuid.UUID `db:"warehouse_id" json:"warehouse_id"`
	QuantityAvailable int       `db:"quantity_available" json:"quantity_available"`
	QuantityReserved  int       `db:"quantity_reserved" json:"quantity_reserved"`
	LowStockThreshold int       `db:"low_stock_threshold" json:"low_stock_threshold"`
	UpdatedAt         time.Time `db:"updated_at" json:"updated_at"`
}

// IsLowStock reports whether available quantity is at or below the configured threshold.
func (i *Inventory) IsLowStock() bool {
	return i.QuantityAvailable <= i.LowStockThreshold
}

// IsOutOfStock reports whether no units are available for sale.
func (i *Inventory) IsOutOfStock() bool {
	return i.QuantityAvailable <= 0
}
