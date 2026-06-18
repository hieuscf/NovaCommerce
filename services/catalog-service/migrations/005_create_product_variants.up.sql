CREATE TABLE product_variants (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id       UUID NOT NULL REFERENCES products (id) ON DELETE CASCADE,
    sku              VARCHAR(100) NOT NULL,
    price            NUMERIC(12, 2) NOT NULL,
    compare_at_price NUMERIC(12, 2) NULL,
    status           VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_product_variants_status CHECK (status IN ('draft', 'active', 'inactive', 'archived'))
);

CREATE UNIQUE INDEX idx_product_variants_sku ON product_variants (sku);
CREATE INDEX idx_product_variants_product_id ON product_variants (product_id);

CREATE TRIGGER trg_product_variants_updated_at
    BEFORE UPDATE ON product_variants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE variant_attribute_values (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variant_id         UUID NOT NULL REFERENCES product_variants (id) ON DELETE CASCADE,
    attribute_value_id UUID NOT NULL REFERENCES attribute_values (id) ON DELETE CASCADE,
    CONSTRAINT uq_variant_attribute_values UNIQUE (variant_id, attribute_value_id)
);
