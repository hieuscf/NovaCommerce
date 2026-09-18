-- Development seed: identities assigned to foundation RBAC roles
-- Password for staff accounts: Admin@123456 (same hash as admin@novacommerce.local)

INSERT INTO "identities" ("id", "email", "status", "disabled", "created_at", "updated_at")
VALUES
  ('33333333-3333-3333-3333-333333330010', 'support.one@novacommerce.local', 'ACTIVE', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('33333333-3333-3333-3333-333333330011', 'support.two@novacommerce.local', 'ACTIVE', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('33333333-3333-3333-3333-333333330012', 'inventory.one@novacommerce.local', 'ACTIVE', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('33333333-3333-3333-3333-333333330013', 'marketing.one@novacommerce.local', 'ACTIVE', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('33333333-3333-3333-3333-333333330014', 'analyst.one@novacommerce.local', 'ACTIVE', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('33333333-3333-3333-3333-333333330015', 'ops.admin@novacommerce.local', 'ACTIVE', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("email") DO UPDATE
SET
  "status" = 'ACTIVE',
  "disabled" = false,
  "updated_at" = CURRENT_TIMESTAMP;

INSERT INTO "credentials" ("id", "identity_id", "password_hash", "algorithm", "created_at", "updated_at")
SELECT v.id::uuid, i.id, v.password_hash, 'scrypt', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM (
  VALUES
    ('33333333-3333-3333-3333-333333330020', 'support.one@novacommerce.local', 'scrypt$00112233445566778899aabbccddeeff$1793c5d129c1cef28d8dca05db7dca181be7ad46b50a4c690aeca607232b46c1af22b5818efae3c36c192fd1938c2a79719414cd00a0ea1936eefa19e5db6a44'),
    ('33333333-3333-3333-3333-333333330021', 'support.two@novacommerce.local', 'scrypt$00112233445566778899aabbccddeeff$1793c5d129c1cef28d8dca05db7dca181be7ad46b50a4c690aeca607232b46c1af22b5818efae3c36c192fd1938c2a79719414cd00a0ea1936eefa19e5db6a44'),
    ('33333333-3333-3333-3333-333333330022', 'inventory.one@novacommerce.local', 'scrypt$00112233445566778899aabbccddeeff$1793c5d129c1cef28d8dca05db7dca181be7ad46b50a4c690aeca607232b46c1af22b5818efae3c36c192fd1938c2a79719414cd00a0ea1936eefa19e5db6a44'),
    ('33333333-3333-3333-3333-333333330023', 'marketing.one@novacommerce.local', 'scrypt$00112233445566778899aabbccddeeff$1793c5d129c1cef28d8dca05db7dca181be7ad46b50a4c690aeca607232b46c1af22b5818efae3c36c192fd1938c2a79719414cd00a0ea1936eefa19e5db6a44'),
    ('33333333-3333-3333-3333-333333330024', 'analyst.one@novacommerce.local', 'scrypt$00112233445566778899aabbccddeeff$1793c5d129c1cef28d8dca05db7dca181be7ad46b50a4c690aeca607232b46c1af22b5818efae3c36c192fd1938c2a79719414cd00a0ea1936eefa19e5db6a44'),
    ('33333333-3333-3333-3333-333333330025', 'ops.admin@novacommerce.local', 'scrypt$00112233445566778899aabbccddeeff$1793c5d129c1cef28d8dca05db7dca181be7ad46b50a4c690aeca607232b46c1af22b5818efae3c36c192fd1938c2a79719414cd00a0ea1936eefa19e5db6a44')
) AS v(id, email, password_hash)
JOIN "identities" i ON i."email" = v.email
WHERE NOT EXISTS (
  SELECT 1 FROM "credentials" c WHERE c."identity_id" = i."id"
);

INSERT INTO "identity_roles" ("identity_id", "role_id")
SELECT i."id", r."id"
FROM (
  VALUES
    ('admin@novacommerce.local', 'super_admin'),
    ('admin@novacommerce.local', 'admin'),
    ('ops.admin@novacommerce.local', 'admin'),
    ('support.one@novacommerce.local', 'customer_support'),
    ('support.two@novacommerce.local', 'customer_support'),
    ('inventory.one@novacommerce.local', 'inventory_manager'),
    ('marketing.one@novacommerce.local', 'marketing_manager'),
    ('analyst.one@novacommerce.local', 'analyst')
) AS v(email, role_name)
JOIN "identities" i ON i."email" = v.email
JOIN "roles" r ON r."name" = v.role_name
ON CONFLICT DO NOTHING;
