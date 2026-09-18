# Identity Module

**Bounded Context:** Identity

**Responsibility:** Authentication, credentials, authorization (RBAC), sessions, OAuth/OIDC foundation, and identity lifecycle.

**Does not own:** Customer profile, addresses, orders, or cart data (see `modules/user` and commerce modules).

## Aggregates & Entities

| Kind | Names |
|------|-------|
| Aggregate Root | `Identity` |
| Entities | `Credential`, `ExternalIdentity`, `RefreshSession`, `Role`, `Permission`, `PasswordResetToken` |
| Value Objects | `EmailAddress`, `IdentityId`, `Provider`, `AccountStatus`, `PlainPassword`, `PermissionKey` |

## Authentication Flow

```text
Register → Identity + Credential → IdentityRegistered (outbox)
Login    → Verify password → JWT access token + refresh session
Refresh  → Rotate refresh token → New access token
Logout   → Revoke refresh session
```

## Authorization Flow

```text
Identity → IdentityRole → Role → RolePermission → Permission
JWT carries roles + permissions; PermissionsGuard enforces at gateway
```

Foundation roles (seeded in `packages/database/prisma/seed/seed_rbac.sql`):

| Role | Type | Scope |
|------|------|--------|
| `super_admin` | System | All catalog permissions |
| `admin` | System | Platform operations (all except deleting accounts/roles) |
| `customer_support` | Custom | Orders, returns, customer profiles |
| `inventory_manager` | Custom | Stock, warehouse, shipping |
| `marketing_manager` | Custom | Promotions, CMS, notifications |
| `analyst` | Custom | Read-only analytics and reports |

Permission keys follow `resource:action` (`identity:role:create`) or `resource:feature:action` (`catalog:product:view`). Regenerate the SQL catalog with `node packages/database/prisma/seed/rbac-catalog.mjs`.

## API Endpoints (Gateway)

| Method | Path |
|--------|------|
| POST | `/api/v1/auth/register` |
| POST | `/api/v1/auth/login` |
| POST | `/api/v1/auth/logout` |
| POST | `/api/v1/auth/refresh` |
| POST | `/api/v1/auth/change-password` |
| POST | `/api/v1/auth/forgot-password` |
| POST | `/api/v1/auth/reset-password` |
| POST | `/api/v1/auth/oauth/callback` |
| GET | `/api/v1/roles` |
| GET | `/api/v1/roles/:roleId/users` |
| POST | `/api/v1/roles` |
| PATCH | `/api/v1/roles/:roleId` |
| DELETE | `/api/v1/roles/:roleId` |
| POST | `/api/v1/roles/:roleId/duplicate` |
| GET | `/api/v1/permissions` |
| POST | `/api/v1/roles/:roleId/permissions` |
| PATCH | `/api/v1/roles/:roleId/permissions` |
| DELETE | `/api/v1/roles/:roleId/permissions?key=` |
| POST | `/api/v1/users/:identityId/roles` |
| DELETE | `/api/v1/users/:identityId/roles/:roleId` |

NestJS controllers live in `apps/gateway/src/identity/`; domain/application/infrastructure remain in this module.

## Domain Events

- `IdentityRegistered`, `IdentityAuthenticated`, `IdentityDisabled`
- `PasswordChanged`, `PasswordResetRequested`, `PasswordResetCompleted`
- `UserLoggedOut`, `RefreshTokenRotated`, `RoleAssigned`, `RoleRevoked`

Events are persisted via outbox in the same transaction as aggregate changes.

## Persistence

PostgreSQL via Prisma: `identities`, `credentials`, `refresh_sessions`, `external_identities`, `roles`, `permissions`, `identity_roles`, `role_permissions`, `password_reset_tokens`, `audit_logs`.

## Security

- Passwords hashed with scrypt (configurable cost)
- Refresh tokens stored as SHA-256 hashes; rotation on refresh
- Generic auth errors; audit log excludes secrets
- OAuth state/nonce/PKCE foundation via Redis

## Testing

- Domain: `modules/identity/domain/**/*.test.ts`
- Application/Infrastructure: handler and service unit tests
- API: `apps/gateway/src/identity/identity.test.ts`
