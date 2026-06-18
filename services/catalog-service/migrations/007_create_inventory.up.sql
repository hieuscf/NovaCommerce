CREATE TABLE inventory (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variant_id          UUID NOT NULL REFERENCES product_variants (id) ON DELETE CASCADE,
    warehouse_id        UUID NOT NULL REFERENCES warehouses (id) ON DELETE CASCADE,
    quantity_available  INT NOT NULL DEFAULT 0,
    quantity_reserved   INT NOT NULL DEFAULT 0,
    low_stock_threshold INT NOT NULL DEFAULT 10,
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_inventory_quantity_available CHECK (quantity_available >= 0),
    CONSTRAINT chk_inventory_quantity_reserved CHECK (quantity_reserved >= 0),
    CONSTRAINT chk_inventory_low_stock_threshold CHECK (low_stock_threshold >= 0)
);

CREATE UNIQUE INDEX idx_inventory_variant_warehouse ON inventory (variant_id, warehouse_id);

CREATE TRIGGER trg_inventory_updated_at
    BEFORE UPDATE ON inventory
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
