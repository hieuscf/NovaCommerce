-- Development seed: platform admin role assignment + admin account
-- Email: admin@novacommerce.local
-- Password: Admin@123456

INSERT INTO "identities" ("id", "email", "status", "disabled", "created_at", "updated_at")
VALUES (
  '33333333-3333-3333-3333-333333330001',
  'admin@novacommerce.local',
  'ACTIVE',
  false,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("email") DO UPDATE
SET
  "status" = 'ACTIVE',
  "disabled" = false,
  "updated_at" = CURRENT_TIMESTAMP;

INSERT INTO "credentials" ("id", "identity_id", "password_hash", "algorithm", "created_at", "updated_at")
VALUES (
  '33333333-3333-3333-3333-333333330002',
  '33333333-3333-3333-3333-333333330001',
  'scrypt$00112233445566778899aabbccddeeff$1793c5d129c1cef28d8dca05db7dca181be7ad46b50a4c690aeca607232b46c1af22b5818efae3c36c192fd1938c2a79719414cd00a0ea1936eefa19e5db6a44',
  'scrypt',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("id") DO UPDATE
SET
  "password_hash" = EXCLUDED."password_hash",
  "algorithm" = EXCLUDED."algorithm",
  "updated_at" = CURRENT_TIMESTAMP;

INSERT INTO "identity_roles" ("identity_id", "role_id")
VALUES
  ('33333333-3333-3333-3333-333333330001', '22222222-2222-2222-2222-222222220001'),
  ('33333333-3333-3333-3333-333333330001', '22222222-2222-2222-2222-222222220002')
ON CONFLICT DO NOTHING;
