CREATE TABLE warehouses (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name       VARCHAR(255) NOT NULL,
    code       VARCHAR(50) NOT NULL,
    address    TEXT NULL,
    city       VARCHAR(100) NULL,
    is_active  BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_warehouses_code ON warehouses (code);

CREATE TRIGGER trg_warehouses_updated_at
    BEFORE UPDATE ON warehouses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
