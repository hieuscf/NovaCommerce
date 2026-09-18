-- Development seed: customer identities for admin Account Management
-- Password: Admin@123456 (same hash as admin@novacommerce.local)

INSERT INTO "identities" ("id", "email", "status", "disabled", "created_at", "updated_at")
VALUES
  ('44444444-4444-4444-4444-444444440001', 'customer.one@novacommerce.local', 'ACTIVE', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('44444444-4444-4444-4444-444444440002', 'customer.two@novacommerce.local', 'ACTIVE', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('44444444-4444-4444-4444-444444440003', 'customer.three@novacommerce.local', 'PENDING_VERIFICATION', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('44444444-4444-4444-4444-444444440004', 'customer.blocked@novacommerce.local', 'LOCKED', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('44444444-4444-4444-4444-444444440005', 'emily.davis@novacommerce.local', 'INACTIVE', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("email") DO UPDATE
SET
  "status" = EXCLUDED."status",
  "disabled" = EXCLUDED."disabled",
  "updated_at" = CURRENT_TIMESTAMP;

INSERT INTO "credentials" ("id", "identity_id", "password_hash", "algorithm", "created_at", "updated_at")
SELECT v.id::uuid, i.id, v.password_hash, 'scrypt', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM (
  VALUES
    ('44444444-4444-4444-4444-444444440011', 'customer.one@novacommerce.local', 'scrypt$00112233445566778899aabbccddeeff$1793c5d129c1cef28d8dca05db7dca181be7ad46b50a4c690aeca607232b46c1af22b5818efae3c36c192fd1938c2a79719414cd00a0ea1936eefa19e5db6a44'),
    ('44444444-4444-4444-4444-444444440012', 'customer.two@novacommerce.local', 'scrypt$00112233445566778899aabbccddeeff$1793c5d129c1cef28d8dca05db7dca181be7ad46b50a4c690aeca607232b46c1af22b5818efae3c36c192fd1938c2a79719414cd00a0ea1936eefa19e5db6a44'),
    ('44444444-4444-4444-4444-444444440013', 'customer.three@novacommerce.local', 'scrypt$00112233445566778899aabbccddeeff$1793c5d129c1cef28d8dca05db7dca181be7ad46b50a4c690aeca607232b46c1af22b5818efae3c36c192fd1938c2a79719414cd00a0ea1936eefa19e5db6a44'),
    ('44444444-4444-4444-4444-444444440014', 'customer.blocked@novacommerce.local', 'scrypt$00112233445566778899aabbccddeeff$1793c5d129c1cef28d8dca05db7dca181be7ad46b50a4c690aeca607232b46c1af22b5818efae3c36c192fd1938c2a79719414cd00a0ea1936eefa19e5db6a44'),
    ('44444444-4444-4444-4444-444444440015', 'emily.davis@novacommerce.local', 'scrypt$00112233445566778899aabbccddeeff$1793c5d129c1cef28d8dca05db7dca181be7ad46b50a4c690aeca607232b46c1af22b5818efae3c36c192fd1938c2a79719414cd00a0ea1936eefa19e5db6a44')
) AS v(id, email, password_hash)
JOIN "identities" i ON i."email" = v.email
WHERE NOT EXISTS (
  SELECT 1 FROM "credentials" c WHERE c."identity_id" = i."id"
);
