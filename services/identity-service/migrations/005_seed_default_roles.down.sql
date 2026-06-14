-- Remove development seed accounts (user_roles cascade via ON DELETE CASCADE).
DELETE FROM users
WHERE email LIKE '%@novacommerce.dev';

-- Remove system roles only when no users are still assigned.
DELETE FROM roles
WHERE is_system = true
  AND NOT EXISTS (
      SELECT 1
      FROM user_roles ur
      WHERE ur.role_id = roles.id
  );
