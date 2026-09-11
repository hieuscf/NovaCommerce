# NovaCommerce Security

> **Version:** 0.1.0  
> **Status:** Identity foundation implemented

## Identity & Authentication

### Passwords

- Plaintext passwords are never stored or logged.
- Hashing uses **scrypt** with per-password salt (`PASSWORD_HASH_COST`, default `16384`).
- Minimum password length: 8 characters (domain validation).

### JWT Access Tokens

- Short-lived access tokens (`JWT_ACCESS_TOKEN_TTL`, default `15m`).
- Signed with `JWT_SECRET` (gateway); payload includes `sub`, `roles`, `permissions` only.
- Access tokens are not used as long-lived sessions.

### Refresh Tokens

- Issued on login/OAuth; stored as **SHA-256 hash** in `refresh_sessions`.
- Rotation on refresh; old session revoked with `replacedBy` link.
- TTL configured via `JWT_REFRESH_TOKEN_TTL` (default `7d`).
- Logout revokes refresh session(s).

### Password Reset

- One-time tokens; stored hashed; short TTL (`PASSWORD_RESET_TOKEN_TTL`, default `1h`).
- Generic response for forgot-password (no email enumeration).
- All refresh sessions revoked after successful reset.

### OAuth / OIDC Foundation

- Provider abstraction (`IOAuthProvider`); stub Google provider for development.
- State and nonce stored in Redis with TTL; PKCE verifier validated on callback.
- External identity keyed by `provider + providerAccountId`, not email alone.

### Authorization (RBAC)

- Permissions use `resource:action` format (e.g. `product:read`).
- Role and permission assignment requires explicit permissions (`identity:role:assign`, etc.).
- Gateway `PermissionsGuard` enforces JWT permission claims.

### Audit Logging

Security-sensitive actions are persisted in `audit_logs`:

`REGISTER`, `LOGIN_SUCCESS`, `LOGIN_FAILURE`, `LOGOUT`, `PASSWORD_CHANGED`, `PASSWORD_RESET_*`, `REFRESH_TOKEN_ROTATED`, `ROLE_ASSIGNED`, `ROLE_REMOVED`, `PERMISSION_CHANGED`, `OAUTH_LOGIN`.

Audit records never contain passwords, token secrets, or raw refresh tokens.

## Environment Variables

See `.env.example` — `JWT_*`, `PASSWORD_HASH_COST`, `PASSWORD_RESET_TOKEN_TTL`.
