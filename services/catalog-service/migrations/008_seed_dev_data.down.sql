-- Remove development seed data (reverse FK order).
-- Safe to run in development only; guarded like the up migration.

DO $$
BEGIN
    IF current_setting('app.environment', true) <> 'development' THEN
        RETURN;
    END IF;

    DELETE FROM inventory
    WHERE variant_id IN (
        SELECT id FROM product_variants
        WHERE sku IN (
            'APP-IPH15P-128', 'APP-MBA-M3-256', 'SAM-GS24U-256', 'SAM-GTAB-S9',
            'XIA-RN13P-128', 'XIA-MB8-BLK', 'FASH-TS-BASIC-M', 'FASH-SNK-SPORT-42',
            'HOME-RC-18L', 'HOME-WP-RO'
        )
    );

    DELETE FROM product_variants
    WHERE sku IN (
        'APP-IPH15P-128', 'APP-MBA-M3-256', 'SAM-GS24U-256', 'SAM-GTAB-S9',
        'XIA-RN13P-128', 'XIA-MB8-BLK', 'FASH-TS-BASIC-M', 'FASH-SNK-SPORT-42',
        'HOME-RC-18L', 'HOME-WP-RO'
    );

    DELETE FROM products
    WHERE slug IN (
        'iphone-15-pro', 'macbook-air-m3', 'galaxy-s24-ultra', 'galaxy-tab-s9',
        'redmi-note-13-pro', 'mi-band-8', 'ao-thun-nam-co-ban', 'giay-sneaker-the-thao',
        'noi-com-dien-tu-1-8l', 'may-loc-nuoc-ro'
    );

    DELETE FROM warehouses WHERE code = 'WH-HCM-01';

    DELETE FROM brands WHERE slug IN ('apple', 'samsung', 'xiaomi');

    DELETE FROM categories WHERE slug IN ('dien-thoai', 'laptop');
    DELETE FROM categories WHERE slug IN ('dien-tu', 'thoi-trang', 'gia-dung');
END $$;
