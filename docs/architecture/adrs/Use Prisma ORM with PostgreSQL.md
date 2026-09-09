# ADR-003: Use Prisma ORM with PostgreSQL

**Status:** Accepted

**Date:** 2026-08-25

---

# Context

NovaCommerce cần một ORM hiện đại cho TypeScript với:

- Type Safety.
- Migration.
- Performance.
- Developer Experience.
- Hỗ trợ PostgreSQL.

---

# Decision

ORM:

**Prisma**

Database:

**PostgreSQL**

---

# Reasons

## Prisma

- Type-safe Client.
- Excellent DX.
- Strong migration support.
- Schema-first.
- Active community.
- First-class TypeScript support.

## PostgreSQL

- ACID.
- JSONB.
- Full-text Search.
- Extensions.
- pgvector.
- High Reliability.
- Open Source.

---

# Architecture

```
Application

↓

Repository Interface

↓

Infrastructure

↓

Prisma Repository

↓

PostgreSQL
```

Prisma chỉ được sử dụng trong Infrastructure.

---

# Future

Có thể thay Prisma bằng:

- Drizzle
- TypeORM
- Sequelize

Không ảnh hưởng Domain.

---

# Consequences

## Positive

- Type-safe.
- Productivity cao.
- Migration rõ ràng.
- Hỗ trợ pgvector.

## Negative

- Không phù hợp với một số truy vấn SQL cực kỳ phức tạp (sử dụng Prisma `$queryRaw` khi cần).
- Prisma Client cần được regenerate sau thay đổi schema.

---

# Alternatives

- TypeORM ❌
- Sequelize ❌
- Drizzle ❌ (đánh giá lại trong tương lai)
- Raw SQL ❌

---

# Decision Outcome

✅ Accepted
