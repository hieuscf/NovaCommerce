# NovaCommerce Frontend Architecture

> **Version:** 1.0  
> **Last updated:** 2026-09-16  
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
│   ├── (store)/         home, shop, product detail, cart, checkout, orders, account + storefront layout
│   ├── error.tsx
│   ├── global-error.tsx
│   └── not-found.tsx
├── components/
│   ├── account/         Alloy account dashboard (presentation fixtures until User/Order APIs)
│   ├── auth/            auth-specific UI (not primitives)
│   ├── commerce/        product cards, listing (PLP), product detail (PDP), cart, checkout, orders, merchandising
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
│   ├── catalog/         listing + PDP fixture selection until Catalog Gateway exists
│   ├── cart/            cart page fixture selection until Cart Gateway exists
│   ├── checkout/        checkout page fixture selection until Checkout Gateway exists
│   ├── orders/          order list/detail/confirmation fixtures until Order Gateway exists
│   ├── view-models/     UI contracts (no backend entities)
│   ├── mock-data/       presentation fixtures until Gateway adapters exist
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
| `/shop` | `(store)` | Product listing. Filters/sort/page live in the URL (`category`, `brand`, `sort`, `page`, …). Catalog photos until the Catalog API is wired. |
| `/products/[slug]` | `(store)` | Product detail. Gallery, variants, reviews, and related products use presentation fixtures until the Catalog Gateway is wired. |
| `/cart` | `(store)` | Shopping cart. Line items, quantity, remove, summary, and recommendations use presentation fixtures until `GET /api/v1/users/me/cart` is wired. Checkout and PayPal buttons navigate to `/checkout` and do not invent Payment APIs. |
| `/checkout` | `(store)` | Protected Alloy checkout (customer + shipping, then Payment Gateway, then review). Presentation fixtures until Cart / User / Checkout Gateway adapters are wired. Payment tiles are presentation methods (`card`, `paypal`, `qr_pay`, `google_pay`) and map to Gateway `paymentProvider` (`vnpay`, `paypal`, `momo`) when checkout is wired. Card/OTP fields stay in the browser and are never posted. Place order navigates to `/orders/confirmed` as a preview success state — it does not call `POST /users/me/checkout`. |
| `/orders` | `(store)` | Protected customer order list (account sidebar + status filters + pagination). Query: `status` (`all` default, plus `processing`, `shipped`, `delivered`, `cancelled`), `page`. Presentation fixtures until Order Gateway adapters are wired. `/account?section=orders` redirects here. |
| `/orders/confirmed` | `(store)` | Protected Alloy order confirmation. Shown after checkout preview; does not invent Payment or Order APIs. |
| `/orders/[orderNumber]` | `(store)` | Protected order detail (timeline, items, shipping, payment, totals). Unknown numbers use `not-found`. |
| `/login` `/register` `/forgot-password` `/reset-password` `/verify-email` | `(auth)` | Authentication |
| `/unauthorized` | `(store)` | 403 access-restricted |
| `/account` | `(store)` | Protected Alloy dashboard (profile, addresses, security). Sections via `?section=`. Not nested `/account/*`. Orders live on `/orders` (`/account?section=orders` redirects there). |

Reserved (do not create empty pages): `/categories`, `/search`, `/account/*`. Account sections stay on `/account?section=` except **Orders**, which is `/orders`. Customer `/orders` is not the Admin reserved `/orders` console route.

### Admin (current)

| Route | Group | Purpose |
|-------|-------|---------|
| `/` | `(console)` | Dashboard |

Reserved: `/catalog`, `/inventory`, `/orders`, `/customers`, `/promotions`, `/settings`, `/login`.

### URL state

Shareable, reloadable state belongs in the URL.

Examples: `/shop?q=laptop&sort=price-asc&sale=true&page=2`, `/shop?category=smartphones&brand=Apple`, `/account?section=security`, `/orders?status=shipped&page=2`

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

**Current storage:** access token in memory; refresh token in a same-origin httpOnly cookie set by the Web BFF (`/api/auth/session`). Tokens are not written to `localStorage` or `sessionStorage`. The UI snapshot starts as `loading`, then `restoreSession()` settles to `authenticated` or `unauthenticated` so reload does not flash “signed out”.

**Production target:** Gateway-issued `httpOnly`, `Secure`, `SameSite` cookies. Until Gateway sets cookies, the Web BFF persists the existing `POST /auth/refresh` token as an httpOnly cookie.

`createApiClient` optional hooks: `onUnauthorized` (401 refresh / expire) and `onForbidden` (403 → `/unauthorized`). Apps own navigation; the transport does not.

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
  → form / ErrorState / toast (`@novacommerce/ui` React-Toastify)
```

Categories: `validation`, `authentication`, `authorization`, `not_found`, `conflict`, `rate_limit`, `network`, `server`, `unknown`.

Backend codes (`VALIDATION_ERROR`, `UNAUTHENTICATED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `RATE_LIMITED`, `INTERNAL_ERROR`, …) map into those categories.

User-facing copy is concise and non-technical. Never show Prisma errors, stack traces, `ECONNREFUSED`, or internal URLs.

Next.js boundaries:

- `error.tsx` — local route segment
- `(store)/error.tsx` / `(console)/error.tsx` — feature-local
- `(store)/shop/error.tsx` — catalog listing load failure (`ErrorState`, retry). Empty filter matches stay `EmptyState`.
- `(store)/products/[slug]/error.tsx` — product detail load failure. Unknown slugs stay `not-found.tsx`.
- `(store)/cart/error.tsx` — cart load failure. An empty cart stays `EmptyState`.
- `(store)/checkout/error.tsx` — checkout load failure. An empty selected cart stays `EmptyState`.
- `(store)/orders/error.tsx` — order list load failure. An empty filter match stays `EmptyState`.
- `(store)/orders/[orderNumber]/error.tsx` — order detail load failure. Unknown order numbers stay `not-found.tsx`.
- `not-found.tsx` — unknown routes
- `global-error.tsx` — root crash (own `html`/`body`)

A shop or product error must not replace the entire application chrome when a segment boundary exists. User-facing catalog copy is non-technical (`Could not load products` / `Could not load this product`); never surface stack traces, Prisma messages, or `digest`.

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

Empty is not an error. Shop with no matches renders `EmptyState`, not `ErrorState`. An empty cart or empty checkout renders `EmptyState`. Catalog listing, PDP, cart, checkout, and order load failures render `ErrorState` with retry. Unknown order numbers render `not-found`.

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
| `NEXT_PUBLIC_API_URL` | Browser + server | Public Gateway origin (`http://localhost:3000` locally) |
| `NEXT_PUBLIC_AUTH_ADAPTER` | Browser (dev only) | Set `mock` to skip Gateway. Leave unset to use Identity. |
| `CORS_ORIGIN` | Gateway | Browser origins allowed to call `/api/v1` with credentials |

Validated by `validatePublicEnv()`:

- Production: required, must be `http:` or `https:`
- Development: defaults to `http://localhost:3000` if unset
- Origin only is stored (path is ignored)

Never expose `JWT_SECRET`, `DATABASE_URL`, Redis, MinIO, or provider keys through `NEXT_PUBLIC_*`.

App-level files: `apps/web/.env.example`, `apps/admin/.env.example`. Copy `apps/web/.env.example` to `apps/web/.env.local` for local Next.js. Root `.env.example` remains the compose/backend catalog.

Local wiring:

```text
Browser (http://localhost:3001)
  → NEXT_PUBLIC_API_URL (http://localhost:3000)
  → Gateway /api/v1
  → Identity
```

Gateway enables CORS for `http://localhost:3001` and `http://localhost:3002` in development when `CORS_ORIGIN` is unset. Production must set `CORS_ORIGIN` explicitly.

Local run (real Identity, not the mock adapter):

```text
docker compose -f docker-compose.dev.yml up -d
pnpm db:migrate:deploy
pnpm --filter @novacommerce/gateway run start:dev   # :3000, loads repo .env
pnpm --filter @novacommerce/web run dev             # :3001, NEXT_PUBLIC_API_URL=http://localhost:3000
```

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

E2E currently covers home, login/register/unauthorized reachability, unauthenticated `/account` redirect, session restore after reload, logout, and admin dashboard smoke.

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

Web: title template, descriptions, Open Graph on the root layout. Auth and account routes `noindex`. Nested `/account/*` routes stay reserved and unindexed.

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
