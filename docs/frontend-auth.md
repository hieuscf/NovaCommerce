# NovaCommerce Frontend Authentication

> Version: 1.2  
> Last updated: 2026-09-14  
> Status: Active — Web customer auth UI

## Scope

This document covers the customer-facing authentication experience in `apps/web`.

Admin authentication is a separate concern in `apps/admin` and must not reuse this layout, navigation, or messaging.

## Implemented vs pending

| Area | Status |
|------|--------|
| Login / register / forgot / reset / verify UI | Implemented |
| Auth state model (`loading` → authenticated / unauthenticated) | Implemented |
| Logout UI + Gateway logout | Implemented |
| Protected-route UX (`RequireAuth` + centralized policy) | Implemented |
| Global 401 session-expired handling | Implemented |
| Global 403 → `/unauthorized` | Implemented |
| Session restore after reload (Next.js httpOnly refresh cookie + `POST /auth/refresh`) | Implemented |
| Categorized auth error UI | Implemented |
| Development mock adapter | Implemented (opt-in, never production) |
| Gateway-issued `httpOnly` cookie sessions | Pending — Web BFF is the current adapter |
| Silent refresh retry of the original request (once) | Implemented via `POST /auth/refresh` |
| OAuth / social sign-in | Pending (button disabled) |
| Remember Me backend field | Not in Identity login DTO — cookie lifetime only |
| Register profile fields (name, terms, marketing) | Collected in UI only — not sent yet |
| Full account dashboard (profile, addresses, orders) | Implemented as presentation UI with mock fixtures. User / Order Gateway adapters pending. Sign out lives on `/account?section=security`. |

Frontend route guards are **UX only**. Gateway / Identity authorization remains authoritative.

## Architecture

```text
UI (AuthCard, forms, AccountMenu)
  ↓
SessionBootstrap / useSession() / RequireAuth
  ↓
AuthSession (in-memory access token only)
  ↓
IAuthClient + /api/auth/session BFF
  ├── GatewayAuthClient   (default)
  └── MockAuthClient      (development only)
  ↓
@novacommerce/frontend HTTP client
  ↓
API Gateway /api/v1
  ↓
Identity module
```

Do not call `fetch` from form components except through `IAuthClient` or the session BFF helper. Do not read refresh tokens in UI.

## Authentication state lifecycle

```text
App
 ↓
SessionBootstrap
 ↓
status: loading
 ↓
GET /api/auth/session
 ├── valid refresh cookie → POST Gateway /auth/refresh → authenticated
 └── missing / invalid cookie → unauthenticated
```

Expected after a signed-in reload:

```text
Authenticated
    ↓
F5
    ↓
loading
    ↓
restore session
    ↓
authenticated
```

SSR / first paint always uses a `loading` snapshot so the header and `RequireAuth` do not flash “signed out”.

## Session restoration

`restoreSession()` is the single bootstrap entry. React components must not call Gateway auth endpoints to decide session state.

| Question | Answer |
|----------|--------|
| Where is the access token stored? | In-memory `authSession` only |
| Where is the refresh token stored? | httpOnly `nc_refresh` cookie set by `apps/web` `/api/auth/session` |
| How is the session restored? | BFF reads the cookie and calls existing `POST /api/v1/auth/refresh` |
| What happens after F5? | Loading → restore → authenticated if the refresh session is valid |
| What happens after browser restart? | Restored only when Remember Me set a persistent cookie. Session cookies die with the browser. |
| What happens when the access token expires? | Next Gateway 401 triggers one refresh, then retries the original request once |
| What happens when API returns 401 after refresh fails? | `markSessionExpired()` → `/login?reason=session-expired` |
| What happens when API returns 403? | Redirect `/unauthorized`. Session stays authenticated |

Refresh tokens are never written to `localStorage` or `sessionStorage`.

## 401 behavior

```text
API 401
 ↓
ignore login/register/refresh/logout/forgot/reset
 ↓
if never authenticated → throw (no session-expired UX)
 ↓
if authenticated → single-flight POST /auth/refresh via BFF
 ├── success → retry original request once
 └── failure → clear session → /login?reason=session-expired
```

Concurrent 401s share one refresh / one expiry navigation. Mutations are not retried unless that single refresh succeeds.

## 403 behavior

```text
API 403
 ↓
/unauthorized
```

Do not logout, do not clear a valid session, do not convert 403 into 401, do not redirect to `/login`.

## Protected route policy

Centralized in `apps/web/src/lib/auth/route-policy.ts`:

```ts
isProtectedRoute(pathname) // alias of isCustomerProtectedPath
```

Customer protected prefixes (UX): `/account`, `/orders`, `/checkout`.

`ProtectedRoutes` in the store layout wraps any matching path with `RequireAuth`. `/account` also keeps its existing `RequireAuth` boundary. `/orders` and `/checkout` are guarded as soon as those pages exist.

Unauthenticated visit:

```text
status: loading
  → resolved unauthenticated
  → /login?returnUrl=<sanitized-path>&reason=session-required
```

Session expired visit:

```text
→ /login?returnUrl=<sanitized-path>&reason=session-expired
```

`/login`, `/register`, and `/unauthorized` are not protected and must not auth-redirect-loop.

## Return URL security

`returnUrl` / `redirect` are sanitized by `sanitizeRedirect` (`@novacommerce/frontend`). Only same-origin relative paths are accepted. Rejected:

- `https://evil.com`
- `//evil.com`
- `javascript:`
- `data:`

Invalid values fall back to `/` (existing UX).

## Routes

| Route | Purpose |
|-------|---------|
| `/login` | Sign in. Query: `returnUrl`, `redirect` (legacy), `registered=true`, `reason=session-expired\|session-required` |
| `/register` | Create account |
| `/forgot-password` | Request reset email |
| `/reset-password?token=...` | Set a new password |
| `/verify-email?status=...` | Verification status (architecture-ready) |
| `/unauthorized` | 403 access-restricted |
| `/account` | Protected dashboard. Query: `section` (`overview` default, plus `orders`, `addresses`, `payment`, `wishlist`, `profile`, `notifications`, `security`, `help`). Not nested `/account/*` routes. |

Auth and account routes are `noindex,nofollow`.

## Auth state model

`useSession()` exposes:

| Field | Values |
|-------|--------|
| `status` | `unknown` \| `loading` \| `authenticated` \| `unauthenticated` \| `error` |
| `isAuthenticated` | derived from a settled access session |
| `isSigningOut` | logout in progress |
| `reason` | `session_expired` \| `null` |
| `signOut()` | revoke via Gateway when possible, always clear local UI state and the refresh cookie |

## API boundary

Default client: `apps/web/src/lib/auth/client.ts` → `POST /api/v1/auth/*`.

| Method | Path | Used by UI |
|--------|------|------------|
| POST | `/auth/login` | Login form |
| POST | `/auth/register` | Register form |
| POST | `/auth/logout` | Header / account sign out |
| POST | `/auth/refresh` | Session BFF restore + 401 recovery |
| POST | `/auth/forgot-password` | Forgot password form |
| POST | `/auth/reset-password` | Reset password form |

Same-origin BFF (not a new Identity contract):

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/auth/session` | Persist refresh cookie after login |
| GET | `/api/auth/session` | Restore access session |
| DELETE | `/api/auth/session` | Clear refresh cookie |

Current Identity login/register contracts accept **email + password only**.

Register does not return tokens. The UI redirects to `/login?registered=true` and does not auto-login.

Logout: UI calls Gateway logout with the access token. If Gateway logout fails, local session and the refresh cookie are still cleared.

## Token storage

`apps/web/src/lib/auth/session.ts` is the only access-token store.

- Access token: in-memory
- Refresh token: httpOnly, `Secure` in production, `SameSite=Lax`, path `/`
- UI must not log access tokens, refresh tokens, or passwords
- Production target remains Gateway-issued cookies; the Web BFF is the adapter until then

## Remember Me

Identity `LoginRequestDto` has no `rememberMe` field. The checkbox is **not** sent to Gateway.

| Remember Me | Cookie lifetime |
|-------------|-----------------|
| Off | Browser session cookie (survives F5, not browser restart) |
| On | `Max-Age` = 7 days, matching `JWT_REFRESH_TOKEN_TTL` default |

Backend refresh-session TTL is still authoritative. Remember Me never uses `localStorage`.

## Development mock

Set `NEXT_PUBLIC_AUTH_ADAPTER=mock` only when `NODE_ENV !== 'production'`. Production ignores this flag.

Documented fixtures (not production credentials):

| Email | Password | Result |
|-------|----------|--------|
| `customer@novacommerce.dev` | `Password8` | Success |
| `locked@novacommerce.dev` | any | Account unavailable |
| `limited@novacommerce.dev` | any | Rate limited |
| `existing@novacommerce.dev` | register | Conflict |

Non-production BFF restore also accepts refresh tokens prefixed `mock-refresh-` so Playwright can follow the real cookie flow without a live Gateway.

## Forms & validation

- `react-hook-form` + `zod` + `@hookform/resolvers`
- Schemas: `apps/web/src/lib/validation/auth-schemas.ts`
- Password policy shown in UI matches Identity `PlainPassword`: **minimum 8 characters**
- Strength meter is advisory only — extra character classes are not required by the backend

## UI components

`apps/web/src/components/auth/`

| Component | Role |
|-----------|------|
| `AuthLayout` | Shared shell for forgot / reset / verify |
| `AuthSplitShell` | Alloy split canvas shared by login and register |
| `LoginShell` | Login copy on `AuthSplitShell` |
| `LoginPodiumArt` | CSS product podium on the auth aside |
| `AuthCard` | Premium form surface |
| `LoginForm` / `RegisterForm` | Forms |
| `PasswordInput` | Masking + keyboard-accessible toggle |
| `PasswordRequirements` | Documented policy checklist |
| `PasswordStrength` | Advisory strength |
| `AuthError` | Categorized Alert (`aria-live`) |
| `AuthSuccessMessage` | Success Alert |
| `SessionExpiredState` | 401 / expired session |
| `UnauthorizedState` | 403 |

Account dashboard (not under `components/auth/`): `AccountDashboard` on `/account`, with sign out on the Security section (`AccountSecurityPanel`).

Navigation: `AccountMenu` in `SiteHeader` (desktop) and sheet actions (mobile).

## Accessibility

- Labels on every field
- `aria-invalid` / `aria-describedby` on invalid fields
- Password toggle is in the tab order (`aria-pressed`, `aria-label`)
- Auth errors use Alert + `aria-live="assertive"`
- Autocomplete: `email`, `current-password`, `new-password`, `given-name`, `family-name`
- Paste is allowed; password managers are not blocked
- `prefers-reduced-motion` via design-system tokens

## Testing

```bash
pnpm --filter @novacommerce/web test
pnpm --filter @novacommerce/frontend test
```

Covered: login/register validation and loading, password toggle, session restore, sanitized return URLs, RequireAuth / protected-route policy, 401 single-flight expiry, 403 unauthorized redirect, mock adapter isolation, Alloy account dashboard sections.

## Related documents

- [frontend-architecture.md](./frontend-architecture.md)
- [design-system.md](./design-system.md)
- [brand-guidelines.md](./brand-guidelines.md)
- [api-guidelines.md](./api-guidelines.md)
- [security.md](./security.md)
