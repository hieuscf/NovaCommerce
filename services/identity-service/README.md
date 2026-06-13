# Identity Service

Core microservice for authentication, authorization, and user management.

## Responsibilities

- User registration, login, logout, password reset
- JWT access tokens (RS256) and refresh tokens
- OAuth2 social login (Google, Facebook)
- RBAC: roles, permissions, user-role assignment
- Publish user lifecycle events to Kafka

## Tech stack

| Component | Technology |
|-----------|------------|
| Language | Go (Gin) |
| Database | PostgreSQL |
| Messaging | Kafka (`user-events`) |
| Auth | JWT, OAuth2, bcrypt |

## Local development

| Setting | Value |
|---------|-------|
| HTTP port | `8081` |
| Health check | `GET /health` |
| API prefix | `/api/v1` |

## Kafka

| Direction | Topic | Events |
|-----------|-------|--------|
| Publish | `user-events` | `USER_REGISTERED`, `USER_UPDATED` |

## Database entities

`users`, `roles`, `permissions`, `user_roles`, `role_permissions`, `oauth_accounts`, `refresh_tokens`

See [docs/ERD.md](../../docs/ERD.md#1-identity-service-postgresql).

## Default roles

`customer`, `seller`, `admin`, `analyst`, `partner`

## Project structure (target)

```
identity-service/
├── cmd/server/          Entrypoint
├── internal/
│   ├── domain/          Entities & repository interfaces
│   ├── application/     Use cases
│   └── infrastructure/  HTTP, PostgreSQL, Kafka
├── migrations/          SQL migrations (golang-migrate)
└── config/
```

## Related tasks

- `SVC-IS-001` → `SVC-IS-005` in [TASKS.md](../../TASKS.md)

## Documentation

- [PROJECT_CONTEXT — Identity Service](../../docs/PROJECT_CONTEXT.md#41-identity-service)
