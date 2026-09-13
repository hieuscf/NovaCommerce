# ADR-005: Establish Frontend Architecture Foundation

**Status:** Accepted

**Date:** 2026-09-13

**Decision Makers:** NovaCommerce Architecture Team

---

# Context

`apps/web` and `apps/admin` existed as Next.js applications with UI work in progress, but without a shared HTTP layer, normalized API errors, typed environment validation, consistent lint/format/test tooling, or a documented frontend architecture.

The platform architecture requires:

```text
Next.js → API Gateway → Modular Monolith
```

Frontends must not access Prisma, databases, or backend domain entities, and Web/Admin must remain separate applications.

---

# Decision

1. Keep two Next.js App Router applications: `apps/web` and `apps/admin`.
2. Share only generic infrastructure via `@novacommerce/ui` (visual) and `@novacommerce/frontend` (HTTP, errors, public env, observability, safe redirect).
3. Organize frontend code by application/features/UI/API — not by backend module folders.
4. Use a single `fetch` transport (`createApiClient`) against Gateway `/api/v1`.
5. Keep session tokens in memory until the Gateway issues httpOnly cookies.
6. Use Zod + React Hook Form on Web; do not add a second validation stack.
7. Use Vitest for unit/component tests and Playwright for E2E smoke tests.
8. Default to Server Components; isolate Three.js.

---

# Consequences

- Web and Admin can evolve independently while sharing transport and tokens.
- Feature APIs stay thin wrappers over one client.
- Cookie-based sessions can replace in-memory storage without changing UI components that only consume `useSession()`.
- TanStack Query and ECharts remain approved-when-needed, not installed unused.
