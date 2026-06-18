ALTER TABLE products
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL;

ALTER TABLE products DROP CONSTRAINT IF EXISTS chk_products_status;
ALTER TABLE products
    ADD CONSTRAINT chk_products_status
        CHECK (status IN ('draft', 'active', 'inactive', 'archived'));

ALTER TABLE product_variants
    ADD COLUMN IF NOT EXISTS weight NUMERIC(10, 3) NULL;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'product_variants' AND column_name = 'compare_at_price'
    ) THEN
        ALTER TABLE product_variants RENAME COLUMN compare_at_price TO compare_price;
    END IF;
END $$;

ALTER TABLE product_images
    ADD COLUMN IF NOT EXISTS alt_text TEXT NOT NULL DEFAULT '';

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'product_images' AND column_name = 'image_url'
    ) THEN
        ALTER TABLE product_images RENAME COLUMN image_url TO url;
    END IF;

    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'product_images' AND column_name = 'sort_order'
    ) THEN
        ALTER TABLE product_images RENAME COLUMN sort_order TO position;
    END IF;
END $$;

ALTER TABLE product_images DROP COLUMN IF EXISTS is_primary;
