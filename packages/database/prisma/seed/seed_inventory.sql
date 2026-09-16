-- Development seed: stock for catalog sample SKUs in the default storefront warehouse.
-- Warehouse id must stay in sync with apps/web `DEFAULT_CHECKOUT_WAREHOUSE_ID`.

DELETE FROM "inventory_items"
WHERE "sku" IN (
  'NOVA-PHONE-X-256',
  'NOVA-BOOK-AIR-13-256',
  'NOVA-QUIET-HP-SILVER',
  'NOVA-WATCH-PRO-46',
  'NOVA-RUNNER-WHT',
  'NOVA-DAYPACK-28-BLK'
)
AND "warehouse_id" = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

INSERT INTO "inventory_items" (
  "id", "sku", "warehouse_id", "on_hand", "reserved", "created_at", "updated_at"
)
VALUES
  (
    '550e8400-e29b-41d4-a716-446655440501',
    'NOVA-PHONE-X-256',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    100,
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    '550e8400-e29b-41d4-a716-446655440502',
    'NOVA-BOOK-AIR-13-256',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    100,
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    '550e8400-e29b-41d4-a716-446655440503',
    'NOVA-QUIET-HP-SILVER',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    100,
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    '550e8400-e29b-41d4-a716-446655440504',
    'NOVA-WATCH-PRO-46',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    100,
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    '550e8400-e29b-41d4-a716-446655440505',
    'NOVA-RUNNER-WHT',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    100,
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    '550e8400-e29b-41d4-a716-446655440506',
    'NOVA-DAYPACK-28-BLK',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    100,
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  );
