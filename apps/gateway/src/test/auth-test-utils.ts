import type { SecurityContext } from '@novacommerce/building-blocks';

export const TEST_USER: SecurityContext = {
  userId: '550e8400-e29b-41d4-a716-446655440001',
  roles: ['customer'],
  permissions: ['orders:read'],
};

export const TEST_ADMIN: SecurityContext = {
  userId: '550e8400-e29b-41d4-a716-446655440002',
  roles: ['admin'],
  permissions: ['admin:read', 'orders:read', 'catalog:write'],
};
