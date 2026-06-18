ALTER TABLE product_images
    ADD COLUMN IF NOT EXISTS is_primary BOOLEAN NOT NULL DEFAULT false;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'product_images' AND column_name = 'position'
    ) THEN
        ALTER TABLE product_images RENAME COLUMN position TO sort_order;
    END IF;

    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'product_images' AND column_name = 'url'
    ) THEN
        ALTER TABLE product_images RENAME COLUMN url TO image_url;
    END IF;
END $$;

ALTER TABLE product_images DROP COLUMN IF EXISTS alt_text;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'product_variants' AND column_name = 'compare_price'
    ) THEN
        ALTER TABLE product_variants RENAME COLUMN compare_price TO compare_at_price;
    END IF;
END $$;

ALTER TABLE product_variants DROP COLUMN IF EXISTS weight;

ALTER TABLE products DROP CONSTRAINT IF EXISTS chk_products_status;
ALTER TABLE products
    ADD CONSTRAINT chk_products_status
        CHECK (status IN ('draft', 'active', 'archived'));

ALTER TABLE products DROP COLUMN IF EXISTS deleted_at;
