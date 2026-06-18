-- Development seed data for Catalog Service.
-- Runs only when app.environment = 'development' (set via migrate connection options).
-- Idempotent: ON CONFLICT on natural keys (slug, sku, code, variant_id+warehouse_id).
-- Fixed UUID prefixes (hex only): c1=category, b1=brand, a301=warehouse, a401=seller, a501=product, a601=variant, a701=inventory.

DO $$
BEGIN
    IF current_setting('app.environment', true) <> 'development' THEN
        RETURN;
    END IF;

    -- === Categories (1 parent + 2 children + 2 roots = 5) ===
    INSERT INTO categories (id, parent_id, name, slug, description, sort_order, status) VALUES
        ('c1000000-0000-4000-8000-000000000001', NULL, 'Điện tử', 'dien-tu', 'Thiết bị điện tử và công nghệ', 1, 'active'),
        ('c1000000-0000-4000-8000-000000000002', 'c1000000-0000-4000-8000-000000000001', 'Điện thoại', 'dien-thoai', 'Điện thoại thông minh', 1, 'active'),
        ('c1000000-0000-4000-8000-000000000003', 'c1000000-0000-4000-8000-000000000001', 'Laptop', 'laptop', 'Máy tính xách tay', 2, 'active'),
        ('c1000000-0000-4000-8000-000000000004', NULL, 'Thời trang', 'thoi-trang', 'Quần áo và phụ kiện', 2, 'active'),
        ('c1000000-0000-4000-8000-000000000005', NULL, 'Gia dụng', 'gia-dung', 'Đồ dùng gia đình', 3, 'active')
    ON CONFLICT (slug) DO NOTHING;

    -- === Brands ===
    INSERT INTO brands (id, name, slug, description, status) VALUES
        ('b1000000-0000-4000-8000-000000000001', 'Apple', 'apple', 'Apple Inc.', 'active'),
        ('b1000000-0000-4000-8000-000000000002', 'Samsung', 'samsung', 'Samsung Electronics', 'active'),
        ('b1000000-0000-4000-8000-000000000003', 'Xiaomi', 'xiaomi', 'Xiaomi Corporation', 'active')
    ON CONFLICT (slug) DO NOTHING;

    -- === Warehouse ===
    INSERT INTO warehouses (id, name, code, address, city, is_active) VALUES
        (
            'a3010000-0000-4000-8000-000000000001',
            'Nova HCM Main Warehouse',
            'WH-HCM-01',
            '123 Nguyễn Văn Linh, Quận 7',
            'Ho Chi Minh City',
            true
        )
    ON CONFLICT (code) DO NOTHING;

    -- seller_id: dev placeholder — align with seller@novacommerce.dev from Identity migration 005 if needed.
    -- === Products (10) ===
    INSERT INTO products (id, seller_id, category_id, brand_id, name, slug, description, status, base_price, currency, metadata) VALUES
        ('a5010000-0000-4000-8000-000000000001', 'a4010000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000002', 'b1000000-0000-4000-8000-000000000001', 'iPhone 15 Pro', 'iphone-15-pro', 'Apple iPhone 15 Pro 128GB', 'active', 28990000, 'VND', '{"color":"natural-titanium"}'),
        ('a5010000-0000-4000-8000-000000000002', 'a4010000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000003', 'b1000000-0000-4000-8000-000000000001', 'MacBook Air M3', 'macbook-air-m3', 'Apple MacBook Air 13" chip M3', 'active', 27990000, 'VND', '{"storage":"256GB"}'),
        ('a5010000-0000-4000-8000-000000000003', 'a4010000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000002', 'b1000000-0000-4000-8000-000000000002', 'Galaxy S24 Ultra', 'galaxy-s24-ultra', 'Samsung Galaxy S24 Ultra 256GB', 'active', 31990000, 'VND', '{"color":"titanium-gray"}'),
        ('a5010000-0000-4000-8000-000000000004', 'a4010000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000002', 'b1000000-0000-4000-8000-000000000002', 'Galaxy Tab S9', 'galaxy-tab-s9', 'Samsung Galaxy Tab S9 Wi-Fi', 'active', 18990000, 'VND', '{}'),
        ('a5010000-0000-4000-8000-000000000005', 'a4010000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000002', 'b1000000-0000-4000-8000-000000000003', 'Redmi Note 13 Pro', 'redmi-note-13-pro', 'Xiaomi Redmi Note 13 Pro 128GB', 'active', 7990000, 'VND', '{}'),
        ('a5010000-0000-4000-8000-000000000006', 'a4010000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000002', 'b1000000-0000-4000-8000-000000000003', 'Mi Band 8', 'mi-band-8', 'Xiaomi Mi Band 8', 'active', 990000, 'VND', '{"color":"black"}'),
        ('a5010000-0000-4000-8000-000000000007', 'a4010000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000004', NULL, 'Áo thun nam cơ bản', 'ao-thun-nam-co-ban', 'Áo thun cotton 100%', 'active', 199000, 'VND', '{"size":"M"}'),
        ('a5010000-0000-4000-8000-000000000008', 'a4010000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000004', NULL, 'Giày sneaker thể thao', 'giay-sneaker-the-thao', 'Giày sneaker unisex', 'active', 890000, 'VND', '{"size":"42"}'),
        ('a5010000-0000-4000-8000-000000000009', 'a4010000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000005', NULL, 'Nồi cơm điện tử 1.8L', 'noi-com-dien-tu-1-8l', 'Nồi cơm điện dung tích 1.8 lít', 'active', 1290000, 'VND', '{}'),
        ('a5010000-0000-4000-8000-000000000010', 'a4010000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000005', NULL, 'Máy lọc nước RO', 'may-loc-nuoc-ro', 'Máy lọc nước RO 10 cấp', 'active', 4590000, 'VND', '{}')
    ON CONFLICT (slug) DO NOTHING;

    -- === Product variants (1 per product) ===
    INSERT INTO product_variants (id, product_id, sku, price, compare_at_price, status) VALUES
        ('a6010000-0000-4000-8000-000000000001', 'a5010000-0000-4000-8000-000000000001', 'APP-IPH15P-128', 28990000, 29990000, 'active'),
        ('a6010000-0000-4000-8000-000000000002', 'a5010000-0000-4000-8000-000000000002', 'APP-MBA-M3-256', 27990000, NULL, 'active'),
        ('a6010000-0000-4000-8000-000000000003', 'a5010000-0000-4000-8000-000000000003', 'SAM-GS24U-256', 31990000, 32990000, 'active'),
        ('a6010000-0000-4000-8000-000000000004', 'a5010000-0000-4000-8000-000000000004', 'SAM-GTAB-S9', 18990000, NULL, 'active'),
        ('a6010000-0000-4000-8000-000000000005', 'a5010000-0000-4000-8000-000000000005', 'XIA-RN13P-128', 7990000, 8490000, 'active'),
        ('a6010000-0000-4000-8000-000000000006', 'a5010000-0000-4000-8000-000000000006', 'XIA-MB8-BLK', 990000, NULL, 'active'),
        ('a6010000-0000-4000-8000-000000000007', 'a5010000-0000-4000-8000-000000000007', 'FASH-TS-BASIC-M', 199000, 249000, 'active'),
        ('a6010000-0000-4000-8000-000000000008', 'a5010000-0000-4000-8000-000000000008', 'FASH-SNK-SPORT-42', 890000, NULL, 'active'),
        ('a6010000-0000-4000-8000-000000000009', 'a5010000-0000-4000-8000-000000000009', 'HOME-RC-18L', 1290000, 1490000, 'active'),
        ('a6010000-0000-4000-8000-000000000010', 'a5010000-0000-4000-8000-000000000010', 'HOME-WP-RO', 4590000, NULL, 'active')
    ON CONFLICT (sku) DO NOTHING;

    -- === Inventory (1 warehouse per variant) ===
    INSERT INTO inventory (id, variant_id, warehouse_id, quantity_available, quantity_reserved, low_stock_threshold) VALUES
        ('a7010000-0000-4000-8000-000000000001', 'a6010000-0000-4000-8000-000000000001', 'a3010000-0000-4000-8000-000000000001', 50, 0, 10),
        ('a7010000-0000-4000-8000-000000000002', 'a6010000-0000-4000-8000-000000000002', 'a3010000-0000-4000-8000-000000000001', 30, 0, 5),
        ('a7010000-0000-4000-8000-000000000003', 'a6010000-0000-4000-8000-000000000003', 'a3010000-0000-4000-8000-000000000001', 40, 0, 10),
        ('a7010000-0000-4000-8000-000000000004', 'a6010000-0000-4000-8000-000000000004', 'a3010000-0000-4000-8000-000000000001', 25, 0, 5),
        ('a7010000-0000-4000-8000-000000000005', 'a6010000-0000-4000-8000-000000000005', 'a3010000-0000-4000-8000-000000000001', 100, 0, 15),
        ('a7010000-0000-4000-8000-000000000006', 'a6010000-0000-4000-8000-000000000006', 'a3010000-0000-4000-8000-000000000001', 200, 0, 20),
        ('a7010000-0000-4000-8000-000000000007', 'a6010000-0000-4000-8000-000000000007', 'a3010000-0000-4000-8000-000000000001', 150, 0, 20),
        ('a7010000-0000-4000-8000-000000000008', 'a6010000-0000-4000-8000-000000000008', 'a3010000-0000-4000-8000-000000000001', 80, 0, 10),
        ('a7010000-0000-4000-8000-000000000009', 'a6010000-0000-4000-8000-000000000009', 'a3010000-0000-4000-8000-000000000001', 60, 0, 10),
        ('a7010000-0000-4000-8000-000000000010', 'a6010000-0000-4000-8000-000000000010', 'a3010000-0000-4000-8000-000000000001', 35, 0, 5)
    ON CONFLICT (variant_id, warehouse_id) DO NOTHING;

END $$;
