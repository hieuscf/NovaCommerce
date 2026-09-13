# NovaCommerce Frontend Architecture

> **Version:** 1.0  
> **Last updated:** 2026-09-13  
> **Status:** Active — foundation implemented  
> **Apps:** `apps/web` (customer storefront), `apps/admin` (operations console)

This document is the source of truth for frontend architecture. Visual tokens live in `docs/design-system.md`. Customer auth UX details live in `docs/frontend-auth.md`.

---

## 1. Frontend architecture overview

NovaCommerce frontends are **API-first Next.js applications**. They never access Prisma, PostgreSQL, Redis, module repositories, or backend domain entities.

```text
                Internet
                    │
             ┌──────┴──────┐
             │             │
          Web App       Admin App
          apps/web      apps/admin
             │             │
             └──────┬──────┘
                    │
         @novacommerce/frontend
              API Client Layer
                    │
             API Gateway / BFF
               apps/gateway
                    │
          ┌─────────┴─────────┐
          │                   │
      Identity             Commerce
                              │
                    ┌─────────┼─────────┐
                    │         │         │
                  Catalog    Cart      Order
                    │
                  ...
```

Request path:

```text
UI / Server Component
        ↓
Feature hook / server function
        ↓
Feature API (authClient, future catalogApi, …)
        ↓
createApiClient()  →  HTTP transport
        ↓
API Gateway  /api/v1
        ↓
Backend module Presentation → Application → Domain
```

The frontends are organized around **application, features, UI, layouts, API/data access, and routing** — not around backend module folders.

---

## 2. Web / Admin boundaries

| | Customer Web (`apps/web`) | Admin (`apps/admin`) |
|---|---|---|
| Audience | Shoppers | Operators / staff |
| Priority | Discovery, conversion, SEO, accessibility | Productivity, density, permissions, tables |
| Port | 3001 | 3002 |
| Session | Customer `authSession` | Isolated `adminSession` |
| SEO | Indexed public catalog/marketing | `noindex, nofollow` |

**May share**

- Design tokens and `@novacommerce/ui` primitives
- `@novacommerce/frontend` HTTP, errors, env, safe-redirect
- Icons (Lucide)
- Accessibility patterns
- Public API contracts (DTOs), never domain entities

**Must not share**

- Page layouts, navigation, or route trees
- Business-specific application state
- Admin permissions or customer checkout workflows

Do not merge Web and Admin into one Next.js app.

---

## 3. Folder structure

Only directories justified by current code exist. Empty feature folders are not scaffolded.

### Customer Web

```text
apps/web/src/
├── app/
│   ├── (auth)/          login, register, password, verify
│   ├── (store)/         home, shop + storefront layout
│   ├── error.tsx
│   ├── global-error.tsx
│   └── not-found.tsx
├── components/
│   ├── auth/            auth-specific UI (not primitives)
│   ├── commerce/
│   ├── feedback/        API / page loading wrappers
│   ├── layout/
│   ├── marketing/
│   ├── navigation/
│   ├── providers/
│   ├── three/           isolated Three.js
│   └── ui/              app-local shells (toaster)
├── features/
│   └── auth/            useSession, RequireAuth
├── lib/
│   ├── api/             configured Gateway client
│   ├── auth/            session, route policy, auth API
│   ├── validation/      Zod schemas
│   ├── url/             shareable query parsers
│   ├── env.ts
│   └── errors.ts
└── test/
```

### Admin

```text
apps/admin/src/
├── app/
│   ├── (console)/       dashboard + admin shell
│   ├── error.tsx
│   ├── global-error.tsx
│   └── not-found.tsx
├── components/layout/
├── features/auth/
└── lib/
    ├── api/
    ├── auth/
    └── env.ts
```

### Shared packages

| Package | Responsibility |
|---------|----------------|
| `@novacommerce/ui` | Tokens, shadcn primitives, EmptyState, ErrorState |
| `@novacommerce/frontend` | HTTP, error model, public env, observability hook, safe redirect |

`@novacommerce/frontend` must stay generic. No catalog/order/identity/admin workflows.

---

## 4. Routing strategy

Both apps use the **Next.js 15 App Router**.

### Customer Web (current)

| Route | Group | Purpose |
|-------|-------|---------|
| `/` | `(store)` | Homepage |
| `/shop` | `(store)` | Catalog browsing |
| `/login` `/register` `/forgot-password` `/reset-password` `/verify-email` | `(auth)` | Authentication |
| `/unauthorized` | `(store)` | 403 access-restricted |
| `/account` | `(store)` | Session surface + logout (protected). Not the full account dashboard. |

Reserved (do not create empty pages): `/categories`, `/products/[slug]`, `/search`, `/cart`, `/checkout`, `/account/*` beyond the session surface.

### Admin (current)

| Route | Group | Purpose |
|-------|-------|---------|
| `/` | `(console)` | Dashboard |

Reserved: `/catalog`, `/inventory`, `/orders`, `/customers`, `/promotions`, `/settings`, `/login`.

### URL state

Shareable, reloadable state belongs in the URL.

Example: `/shop?q=laptop&sort=price-asc&sale=true&page=2`

Parsers live in `lib/url/`. Do not put search/sort/pagination into global React state.

---

## 5. API client architecture

One HTTP transport. Feature functions call it. No `catalogFetch` / `orderFetch` duplicates.

```ts
getApiClient().post<AuthenticationResponse>('/auth/login', credentials);
```

`createApiClient` (`packages/frontend`):

- Resolves `{baseUrl}/api/v1{path}`
- Sends `x-request-id` and `x-correlation-id` (Gateway contract)
- Attaches `Authorization: Bearer` only when a token accessor returns a value
- Uses `credentials: 'include'` for future cookie sessions
- Unwraps `{ data, meta }`
- Normalizes `{ error: { code, message, details, requestId } }`
- Applies a 15s timeout
- Never logs bodies, tokens, or passwords

Apps configure the client with their own session accessor. Web and Admin do not share session objects.

---

## 6. Authentication / session boundary

Backend remains authoritative: JWT access token, refresh token, OAuth/OIDC, Redis session/permission cache. See `docs/security.md` and `docs/frontend-auth.md`.

```text
Browser
  → Web/Admin auth layer (session abstraction)
  → API Gateway
  → Identity module
```

**Current storage:** in-memory only. Tokens are not written to `localStorage` or `sessionStorage`. The UI snapshot starts as `loading`, then settles to `authenticated` or `unauthenticated` to avoid signed-out flicker.

**Production target:** Gateway-issued `httpOnly`, `Secure`, `SameSite` cookies. Until that exists, in-memory storage avoids accidental XSS token theft at the cost of losing session on reload.

UI rules:

- Components use `useSession()` / `getSession()` (`isAuthenticated` only)
- Components must not read refresh tokens
- Do not log access tokens, refresh tokens, or passwords
- `signIn` / `signOut` hide storage details

Frontend route guards (`RequireAuth`, route policies) are **UX protection**. Hidden UI is not a security boundary.

---

## 7. Error handling

```text
API / thrown value
  → ApiClientError (category, code, requestId)
  → getUserFacingMessage()
  → form / ErrorState / toast
```

Categories: `validation`, `authentication`, `authorization`, `not_found`, `conflict`, `rate_limit`, `network`, `server`, `unknown`.

Backend codes (`VALIDATION_ERROR`, `UNAUTHENTICATED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `RATE_LIMITED`, `INTERNAL_ERROR`, …) map into those categories.

User-facing copy is concise and non-technical. Never show Prisma errors, stack traces, `ECONNREFUSED`, or internal URLs.

Next.js boundaries:

- `error.tsx` — local route segment
- `(store)/error.tsx` / `(console)/error.tsx` — feature-local
- `not-found.tsx` — unknown routes
- `global-error.tsx` — root crash (own `html`/`body`)

A shop error must not replace the entire application chrome when a segment boundary exists.

Structured reporting uses `reportFrontendEvent` (no-op until a reporter is attached). Do not use `console.log` for production errors.

---

## 8. Loading states

- Route `loading.tsx` for segment-level pending UI
- Skeleton components for partial content (`ProductGrid` `loading`, admin dashboard skeletons)
- Avoid a full-page spinner when only one section is loading
- Prefer Server Components so HTML can stream

---

## 9. Empty states

Use `@novacommerce/ui` `EmptyState`: icon, title, explanation, action.

Empty is not an error. Shop with no matches renders `EmptyState`, not `ErrorState`.

---

## 10. Validation strategy

Layers:

```text
UI validation (Zod + React Hook Form)
  → API request shape
  → Backend Presentation validation (authoritative)
```

- Web already uses Zod + React Hook Form + `@hookform/resolvers`
- Do not add a second form/validation library
- Password confirmation is valid frontend UX
- Whether a customer may complete a business operation remains a backend rule
- Accessible errors: `aria-invalid`, `aria-describedby`, `role="alert"`

Admin will adopt the same libraries when it grows forms. Do not install unused copies early.

---

## 11. Environment variables

| Variable | Surface | Purpose |
|----------|---------|---------|
| `NEXT_PUBLIC_API_URL` | Browser + server | Public Gateway origin |

Validated by `validatePublicEnv()`:

- Production: required, must be `http:` or `https:`
- Development: defaults to `http://localhost:3000` if unset
- Origin only is stored (path is ignored)

Never expose `JWT_SECRET`, `DATABASE_URL`, Redis, MinIO, or provider keys through `NEXT_PUBLIC_*`.

App-level files: `apps/web/.env.example`, `apps/admin/.env.example`. Root `.env.example` remains the compose/backend catalog.

---

## 12. TypeScript configuration

`apps/web`, `apps/admin`, `packages/ui`, and `packages/frontend` use `strict: true`.

Frontend apps also enable:

- `forceConsistentCasingInFileNames`
- `noFallthroughCasesInSwitch`

`packages/frontend` additionally uses `noUncheckedIndexedAccess`.

Do not use `any`, `@ts-ignore`, or `@ts-nocheck` to silence errors.

Path alias: `@/*` → `./src/*`.

---

## 13. ESLint / Prettier

- Web/Admin: `eslint-config-next` (`core-web-vitals` + `typescript`) + `eslint-config-prettier`
- Repository: `.prettierrc.json` (single quotes, trailing commas, 100 columns)
- One formatting style for Web and Admin
- Do not disable lint rules to force a green build

```bash
pnpm lint
pnpm format:check
```

---

## 14. Testing architecture

| Layer | Tool | Location |
|-------|------|----------|
| Unit | Vitest | `packages/frontend`, `apps/*/src/lib/**/*.test.ts` |
| Component | Vitest + Testing Library | `apps/web/src/components/**/__tests__` |
| Integration | Vitest + mocked Gateway `fetch` | auth forms, API client |
| E2E smoke | Playwright | `tests/e2e/smoke` |

```bash
pnpm test:frontend
pnpm --filter @novacommerce/web test:coverage
pnpm test:e2e
```

Tests must not call production services. Mock `fetch` or run against local Gateway. Coverage reporting is enabled; project-wide ≥80% remains the platform target and is enforced first on `@novacommerce/frontend` (the new logic-heavy package). Do not exclude files merely to inflate coverage.

E2E currently covers home, login reachability, and admin dashboard smoke. Broader journeys wait for those features.

---

## 15. State management principles

| Kind | Home |
|------|------|
| Server state | Server Components / future fetchers. TanStack Query is listed in `techContext.md` and may be added when cache/invalidation is actually needed — not before. |
| URL state | Search, sort, filters, page |
| Local UI state | Dialogs, mobile nav, password visibility |
| Session state | `authSession` / `adminSession` |
| Application state | Do not create a global store by default |

Do not introduce Redux or Zustand without a documented cross-route client state problem.

---

## 16. Server / Client Component rules

- Default to Server Components
- Client Components (`'use client'`) only for interactivity, browser APIs, forms, dialogs, animations, Three.js
- Data fetching prefers the server
- Layouts should stay server components when they only compose children

---

## 17. Security principles

- Frontend authorization is UX only
- Sanitize redirects (`sanitizeRedirect`) — no open redirects
- Do not inject unsanitized HTML
- Do not log credentials or tokens (`redactContext`)
- Do not trust hidden buttons as access control
- CORS is configured on the Gateway, not invented in the browser
- Auth and account pages are `noindex`

---

## 18. Performance principles

- Server Components and streaming `loading.tsx`
- `next/image` for remote catalog images
- Isolate heavy clients (Three.js, future charts/editors) behind dynamic import
- Respect `prefers-reduced-motion`
- Minimize client JavaScript on marketing/catalog pages

---

## 19. Shared UI package strategy

`@novacommerce/ui` is the design system:

- Tokens synced with `assets/design-tokens.*`
- shadcn/Radix primitives customized to NovaCommerce
- Lucide icons only
- No business logic, no API clients, no Prisma types

When adding a primitive, add it once here. Feature folders must not duplicate `Button` / `Input` / `Dialog`.

---

## 20. Three.js boundary

Three.js is progressive enhancement in `apps/web/src/components/three/`.

It must not implement navigation, forms, tables, checkout, or accessibility-critical UI. Desktop-only hero scene; static fallback on mobile and `prefers-reduced-motion`. Lazy-load the canvas.

---

## 21. Decision rules for adding dependencies

Add a dependency only when:

1. `techContext.md` already names it **and** a current feature needs it, or
2. There is no equivalent already in the monorepo, and
3. It does not pull business logic into a shared package

| Proposed | Decision |
|----------|----------|
| Zod / React Hook Form | Use (already present on Web) |
| TanStack Query | Approved in tech context; install when server-state caching is required |
| ECharts | Admin reporting only, when a reporting API exists; lazy-load |
| Redux / Zustand | Do not add by default |
| Axios | Do not add — `createApiClient` wraps `fetch` |
| Second icon set | Do not add — Lucide is standard |

---

## Accessibility foundation

Target WCAG 2.2 AA: semantic HTML, keyboard access, visible focus, labeled forms, Radix dialogs/sheets, `aria-live` for errors, 44px touch targets, reduced motion.

---

## SEO boundary

Web: title template, descriptions, Open Graph on the root layout. Auth routes `noindex`. Future account routes must stay unindexed.

Admin: entire app `noindex, nofollow`.

---

## Observability extension points

`createRequestId()`, `x-request-id` / `x-correlation-id`, and `setFrontendLogReporter()` are the hooks for future error reporting and performance monitoring. Do not build a vendor platform in the foundation.

---

## Conflicts resolved during this foundation

| Conflict | Resolution |
|----------|------------|
| `docs/reponsitory-structure.md` listed `packages/shared` but the repo has `packages/ui` and `packages/infrastructure` | Docs updated; `packages/frontend` added for shared frontend infrastructure |
| `docs/contributing.md` said root `pnpm test` / `pnpm lint` did not exist | Stale — scripts exist and now include frontend |
| `docs/README.md` listed `security.md` as planned | It exists |
| `techContext.md` lists TanStack Query / ECharts | Treat as approved-when-needed; not installed unused |
| Auth HTTP was duplicated inside `lib/auth/client.ts` | Replaced by `@novacommerce/frontend` transport |

---

## Related documents

- [design-system.md](./design-system.md)
- [frontend-auth.md](./frontend-auth.md)
- [api-guidelines.md](./api-guidelines.md)
- [brand-guidelines.md](./brand-guidelines.md)
- [security.md](./security.md)
- [coding-standards.md](./coding-standards.md)
- [ADR-005](./architecture/adrs/Establish%20Frontend%20Architecture%20Foundation.md)
