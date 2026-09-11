INSERT INTO "permissions" ("id", "key", "resource", "action", "created_at", "updated_at")
SELECT '11111111-1111-1111-1111-111111110001', 'identity:role:create', 'identity', 'role:create', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "permissions" WHERE "key" = 'identity:role:create');

INSERT INTO "permissions" ("id", "key", "resource", "action", "created_at", "updated_at")
SELECT '11111111-1111-1111-1111-111111110002', 'identity:role:assign', 'identity', 'role:assign', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "permissions" WHERE "key" = 'identity:role:assign');

INSERT INTO "permissions" ("id", "key", "resource", "action", "created_at", "updated_at")
SELECT '11111111-1111-1111-1111-111111110003', 'identity:role:revoke', 'identity', 'role:revoke', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "permissions" WHERE "key" = 'identity:role:revoke');

INSERT INTO "permissions" ("id", "key", "resource", "action", "created_at", "updated_at")
SELECT '11111111-1111-1111-1111-111111110004', 'identity:permission:assign', 'identity', 'permission:assign', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "permissions" WHERE "key" = 'identity:permission:assign');

INSERT INTO "permissions" ("id", "key", "resource", "action", "created_at", "updated_at")
SELECT '11111111-1111-1111-1111-111111110005', 'admin:status:read', 'admin', 'status:read', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "permissions" WHERE "key" = 'admin:status:read');

INSERT INTO "permissions" ("id", "key", "resource", "action", "created_at", "updated_at")
SELECT '11111111-1111-1111-1111-111111110006', 'admin:read', 'admin', 'read', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "permissions" WHERE "key" = 'admin:read');

INSERT INTO "roles" ("id", "name", "description", "created_at", "updated_at")
SELECT '22222222-2222-2222-2222-222222220001', 'admin', 'Platform administrator', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "roles" WHERE "name" = 'admin');

INSERT INTO "role_permissions" ("role_id", "permission_id")
SELECT '22222222-2222-2222-2222-222222220001', p.id
FROM "permissions" p
WHERE p."key" IN (
  'identity:role:create',
  'identity:role:assign',
  'identity:role:revoke',
  'identity:permission:assign',
  'admin:status:read',
  'admin:read'
)
AND NOT EXISTS (
  SELECT 1
  FROM "role_permissions" rp
  WHERE rp.role_id = '22222222-2222-2222-2222-222222220001'
    AND rp.permission_id = p.id
);
