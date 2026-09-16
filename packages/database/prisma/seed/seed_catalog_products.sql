-- Development seed: sample catalog categories + published products for storefront /shop and /
-- Uses RFC-compliant UUIDs so Gateway `@IsUUID()` accepts cart add `productId`.

-- Clean previous sample rows (by slug) so ids can be corrected idempotently.
DELETE FROM "product_variants"
WHERE "product_id" IN (SELECT "id" FROM "products" WHERE "slug" IN (
  'nova-phone-x', 'nova-book-air-13', 'nova-quiet-headphones', 'nova-watch-pro', 'nova-runner-sneakers', 'nova-daypack-28l'
));

DELETE FROM "product_attributes"
WHERE "product_id" IN (SELECT "id" FROM "products" WHERE "slug" IN (
  'nova-phone-x', 'nova-book-air-13', 'nova-quiet-headphones', 'nova-watch-pro', 'nova-runner-sneakers', 'nova-daypack-28l'
));

DELETE FROM "product_images"
WHERE "product_id" IN (SELECT "id" FROM "products" WHERE "slug" IN (
  'nova-phone-x', 'nova-book-air-13', 'nova-quiet-headphones', 'nova-watch-pro', 'nova-runner-sneakers', 'nova-daypack-28l'
));

DELETE FROM "products"
WHERE "slug" IN (
  'nova-phone-x', 'nova-book-air-13', 'nova-quiet-headphones', 'nova-watch-pro', 'nova-runner-sneakers', 'nova-daypack-28l'
);

DELETE FROM "categories"
WHERE "slug" IN ('smartphones', 'laptops', 'accessories', 'electronics', 'fashion');

-- =============================================================================
-- Categories (roots first, then children)
-- =============================================================================

INSERT INTO "categories" ("id", "name", "slug", "parent_id", "created_at", "updated_at")
VALUES
  ('550e8400-e29b-41d4-a716-446655440101', 'Electronics', 'electronics', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('550e8400-e29b-41d4-a716-446655440105', 'Fashion', 'fashion', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO "categories" ("id", "name", "slug", "parent_id", "created_at", "updated_at")
VALUES
  (
    '550e8400-e29b-41d4-a716-446655440102',
    'Smartphones',
    'smartphones',
    (SELECT "id" FROM "categories" WHERE "slug" = 'electronics'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    '550e8400-e29b-41d4-a716-446655440103',
    'Laptops',
    'laptops',
    (SELECT "id" FROM "categories" WHERE "slug" = 'electronics'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    '550e8400-e29b-41d4-a716-446655440104',
    'Accessories',
    'accessories',
    (SELECT "id" FROM "categories" WHERE "slug" = 'electronics'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  );

-- =============================================================================
-- Products (published)
-- =============================================================================

INSERT INTO "products" (
  "id", "name", "slug", "base_price_amount", "base_price_currency", "status", "category_id", "created_at", "updated_at"
)
VALUES
  (
    '550e8400-e29b-41d4-a716-446655440001',
    'Nova Phone X',
    'nova-phone-x',
    799.0000,
    'USD',
    'published',
    (SELECT "id" FROM "categories" WHERE "slug" = 'smartphones'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    '550e8400-e29b-41d4-a716-446655440002',
    'Nova Book Air 13',
    'nova-book-air-13',
    999.0000,
    'USD',
    'published',
    (SELECT "id" FROM "categories" WHERE "slug" = 'laptops'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    '550e8400-e29b-41d4-a716-446655440003',
    'Nova Quiet Headphones',
    'nova-quiet-headphones',
    279.0000,
    'USD',
    'published',
    (SELECT "id" FROM "categories" WHERE "slug" = 'accessories'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    '550e8400-e29b-41d4-a716-446655440004',
    'Nova Watch Pro',
    'nova-watch-pro',
    429.0000,
    'USD',
    'published',
    (SELECT "id" FROM "categories" WHERE "slug" = 'accessories'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    '550e8400-e29b-41d4-a716-446655440005',
    'Nova Runner Sneakers',
    'nova-runner-sneakers',
    119.0000,
    'USD',
    'published',
    (SELECT "id" FROM "categories" WHERE "slug" = 'fashion'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    '550e8400-e29b-41d4-a716-446655440006',
    'Nova Daypack 28L',
    'nova-daypack-28l',
    89.0000,
    'USD',
    'published',
    (SELECT "id" FROM "categories" WHERE "slug" = 'fashion'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  );

-- =============================================================================
-- Images
-- =============================================================================

INSERT INTO "product_images" ("id", "product_id", "url", "sort_order", "created_at", "updated_at")
VALUES
  (
    '550e8400-e29b-41d4-a716-446655440201',
    (SELECT "id" FROM "products" WHERE "slug" = 'nova-phone-x'),
    'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&h=800&fit=crop',
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    '550e8400-e29b-41d4-a716-446655440202',
    (SELECT "id" FROM "products" WHERE "slug" = 'nova-book-air-13'),
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=800&fit=crop',
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    '550e8400-e29b-41d4-a716-446655440203',
    (SELECT "id" FROM "products" WHERE "slug" = 'nova-quiet-headphones'),
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop',
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    '550e8400-e29b-41d4-a716-446655440204',
    (SELECT "id" FROM "products" WHERE "slug" = 'nova-watch-pro'),
    'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800&h=800&fit=crop',
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    '550e8400-e29b-41d4-a716-446655440205',
    (SELECT "id" FROM "products" WHERE "slug" = 'nova-runner-sneakers'),
    'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&h=800&fit=crop',
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    '550e8400-e29b-41d4-a716-446655440206',
    (SELECT "id" FROM "products" WHERE "slug" = 'nova-daypack-28l'),
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop',
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  );

-- =============================================================================
-- Attributes
-- =============================================================================

INSERT INTO "product_attributes" ("id", "product_id", "name", "value", "created_at", "updated_at")
VALUES
  ('550e8400-e29b-41d4-a716-446655440301', (SELECT "id" FROM "products" WHERE "slug" = 'nova-phone-x'), 'Brand', 'Nova', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('550e8400-e29b-41d4-a716-446655440302', (SELECT "id" FROM "products" WHERE "slug" = 'nova-phone-x'), 'Rating', '4.8', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('550e8400-e29b-41d4-a716-446655440303', (SELECT "id" FROM "products" WHERE "slug" = 'nova-phone-x'), 'ReviewCount', '1240', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

  ('550e8400-e29b-41d4-a716-446655440311', (SELECT "id" FROM "products" WHERE "slug" = 'nova-book-air-13'), 'Brand', 'Nova', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('550e8400-e29b-41d4-a716-446655440312', (SELECT "id" FROM "products" WHERE "slug" = 'nova-book-air-13'), 'Rating', '4.7', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('550e8400-e29b-41d4-a716-446655440313', (SELECT "id" FROM "products" WHERE "slug" = 'nova-book-air-13'), 'CompareAtPrice', '1199', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('550e8400-e29b-41d4-a716-446655440314', (SELECT "id" FROM "products" WHERE "slug" = 'nova-book-air-13'), 'ReviewCount', '860', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

  ('550e8400-e29b-41d4-a716-446655440321', (SELECT "id" FROM "products" WHERE "slug" = 'nova-quiet-headphones'), 'Brand', 'Nova', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('550e8400-e29b-41d4-a716-446655440322', (SELECT "id" FROM "products" WHERE "slug" = 'nova-quiet-headphones'), 'Rating', '4.6', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('550e8400-e29b-41d4-a716-446655440323', (SELECT "id" FROM "products" WHERE "slug" = 'nova-quiet-headphones'), 'CompareAtPrice', '349', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('550e8400-e29b-41d4-a716-446655440324', (SELECT "id" FROM "products" WHERE "slug" = 'nova-quiet-headphones'), 'ReviewCount', '512', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

  ('550e8400-e29b-41d4-a716-446655440331', (SELECT "id" FROM "products" WHERE "slug" = 'nova-watch-pro'), 'Brand', 'Nova', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('550e8400-e29b-41d4-a716-446655440332', (SELECT "id" FROM "products" WHERE "slug" = 'nova-watch-pro'), 'Rating', '4.7', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('550e8400-e29b-41d4-a716-446655440333', (SELECT "id" FROM "products" WHERE "slug" = 'nova-watch-pro'), 'Badge', 'new', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('550e8400-e29b-41d4-a716-446655440334', (SELECT "id" FROM "products" WHERE "slug" = 'nova-watch-pro'), 'ReviewCount', '220', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

  ('550e8400-e29b-41d4-a716-446655440341', (SELECT "id" FROM "products" WHERE "slug" = 'nova-runner-sneakers'), 'Brand', 'Nova', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('550e8400-e29b-41d4-a716-446655440342', (SELECT "id" FROM "products" WHERE "slug" = 'nova-runner-sneakers'), 'Rating', '4.5', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('550e8400-e29b-41d4-a716-446655440343', (SELECT "id" FROM "products" WHERE "slug" = 'nova-runner-sneakers'), 'CompareAtPrice', '149', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('550e8400-e29b-41d4-a716-446655440344', (SELECT "id" FROM "products" WHERE "slug" = 'nova-runner-sneakers'), 'ReviewCount', '340', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

  ('550e8400-e29b-41d4-a716-446655440351', (SELECT "id" FROM "products" WHERE "slug" = 'nova-daypack-28l'), 'Brand', 'Nova', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('550e8400-e29b-41d4-a716-446655440352', (SELECT "id" FROM "products" WHERE "slug" = 'nova-daypack-28l'), 'Rating', '4.4', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('550e8400-e29b-41d4-a716-446655440353', (SELECT "id" FROM "products" WHERE "slug" = 'nova-daypack-28l'), 'CompareAtPrice', '99', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('550e8400-e29b-41d4-a716-446655440354', (SELECT "id" FROM "products" WHERE "slug" = 'nova-daypack-28l'), 'ReviewCount', '188', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- =============================================================================
-- Variants
-- =============================================================================

INSERT INTO "product_variants" (
  "id", "product_id", "sku", "price_amount", "price_currency", "attributes", "created_at", "updated_at"
)
VALUES
  (
    '550e8400-e29b-41d4-a716-446655440401',
    (SELECT "id" FROM "products" WHERE "slug" = 'nova-phone-x'),
    'NOVA-PHONE-X-256',
    799.0000,
    'USD',
    '{"Storage":"256GB","Color":"Natural Titanium"}'::jsonb,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    '550e8400-e29b-41d4-a716-446655440402',
    (SELECT "id" FROM "products" WHERE "slug" = 'nova-book-air-13'),
    'NOVA-BOOK-AIR-13-256',
    999.0000,
    'USD',
    '{"Storage":"256GB","Color":"Space Gray"}'::jsonb,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    '550e8400-e29b-41d4-a716-446655440403',
    (SELECT "id" FROM "products" WHERE "slug" = 'nova-quiet-headphones'),
    'NOVA-QUIET-HP-SILVER',
    279.0000,
    'USD',
    '{"Color":"Silver"}'::jsonb,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    '550e8400-e29b-41d4-a716-446655440404',
    (SELECT "id" FROM "products" WHERE "slug" = 'nova-watch-pro'),
    'NOVA-WATCH-PRO-46',
    429.0000,
    'USD',
    '{"Size":"46mm","Color":"Black"}'::jsonb,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    '550e8400-e29b-41d4-a716-446655440405',
    (SELECT "id" FROM "products" WHERE "slug" = 'nova-runner-sneakers'),
    'NOVA-RUNNER-WHT',
    119.0000,
    'USD',
    '{"Color":"White","Size":"42"}'::jsonb,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    '550e8400-e29b-41d4-a716-446655440406',
    (SELECT "id" FROM "products" WHERE "slug" = 'nova-daypack-28l'),
    'NOVA-DAYPACK-28-BLK',
    89.0000,
    'USD',
    '{"Color":"Black","Capacity":"28L"}'::jsonb,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  );
