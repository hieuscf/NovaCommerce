CREATE TABLE products (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id   UUID NOT NULL,
    category_id UUID NOT NULL REFERENCES categories (id) ON DELETE RESTRICT,
    brand_id    UUID NULL REFERENCES brands (id) ON DELETE SET NULL,
    name        VARCHAR(255) NOT NULL,
    slug        VARCHAR(255) NOT NULL,
    description TEXT NULL,
    status      VARCHAR(20) NOT NULL DEFAULT 'draft',
    base_price  NUMERIC(12, 2) NOT NULL DEFAULT 0,
    currency    VARCHAR(3) NOT NULL DEFAULT 'USD',
    metadata    JSONB NOT NULL DEFAULT '{}',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_products_status CHECK (status IN ('draft', 'active', 'archived'))
);

CREATE UNIQUE INDEX idx_products_slug ON products (slug);
CREATE INDEX idx_products_seller_id ON products (seller_id);
CREATE INDEX idx_products_category_id ON products (category_id);
CREATE INDEX idx_products_brand_id ON products (brand_id);

CREATE TRIGGER trg_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE product_images (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products (id) ON DELETE CASCADE,
    image_url  TEXT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
