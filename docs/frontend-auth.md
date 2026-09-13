# NovaCommerce Frontend Authentication

> Version: 1.1  
> Last updated: 2026-09-13  
> Status: Active — Web customer auth UI

## Scope

This document covers the customer-facing authentication experience in `apps/web`.

Admin authentication is a separate concern in `apps/admin` and must not reuse this layout, navigation, or messaging.

## Implemented vs pending

| Area | Status |
|------|--------|
| Login / register / forgot / reset / verify UI | Implemented |
| Auth state model (`loading` → authenticated / unauthenticated) | Implemented |
| Logout UI + Gateway logout integration point | Implemented |
| Protected-route UX (`RequireAuth`) | Implemented |
| 401 session-expired vs 403 unauthorized | Implemented |
| Categorized auth error UI | Implemented |
| Development mock adapter | Implemented (opt-in, never production) |
| Gateway `httpOnly` cookie sessions | Pending |
| Token refresh / silent renew | Pending |
| OAuth / social sign-in | Pending (button disabled) |
| Register profile fields (name, terms, marketing) | Collected in UI only — not sent yet |
| Full account dashboard (profile, addresses, orders) | Pending |

Frontend route guards are **UX only**. Gateway / Identity authorization remains authoritative.

## Architecture

```text
UI (AuthCard, forms, AccountMenu)
  ↓
useSession() / RequireAuth
  ↓
AuthSession (in-memory snapshot, no refresh token in UI)
  ↓
IAuthClient
  ├── GatewayAuthClient   (default)
  └── MockAuthClient      (development only)
  ↓
@novacommerce/frontend HTTP client
  ↓
API Gateway /api/v1
  ↓
Identity module
```

Do not call `fetch` from form components. Do not read refresh tokens in UI.

## Routes

| Route | Purpose |
|-------|---------|
| `/login` | Sign in. Query: `returnUrl`, `redirect` (legacy), `registered=true`, `reason=session-expired\|session-required` |
| `/register` | Create account |
| `/forgot-password` | Request reset email |
| `/reset-password?token=...` | Set a new password |
| `/verify-email?status=...` | Verification status (architecture-ready) |
| `/unauthorized` | 403 access-restricted |
| `/account` | Session surface + sign out (protected). Not the full account dashboard. |

Auth and account routes are `noindex,nofollow`.

Customer protected prefixes (UX): `/account`, `/orders`, `/checkout`.

Unauthenticated visit to a protected route:

```text
status: loading
  → resolved unauthenticated
  → /login?returnUrl=<sanitized-path>&reason=session-required
```

`returnUrl` / `redirect` are sanitized to same-origin relative paths. Open redirects are rejected.

## Auth state model

`useSession()` exposes:

| Field | Values |
|-------|--------|
| `status` | `unknown` \| `loading` \| `authenticated` \| `unauthenticated` \| `error` |
| `isAuthenticated` | derived from settled tokens |
| `isSigningOut` | logout in progress |
| `reason` | `session_expired` \| `null` |
| `signOut()` | revoke via Gateway when possible, always clear local UI state |

SSR / first paint uses a `loading` snapshot so the header and `RequireAuth` do not flash “signed out” before memory is read.

In-memory tokens do **not** survive a full page reload. After reload the session settles to `unauthenticated` until Gateway cookie sessions exist.

## API boundary

Default client: `apps/web/src/lib/auth/client.ts` → `POST /api/v1/auth/*`.

| Method | Path | Used by UI |
|--------|------|------------|
| POST | `/auth/login` | Login form |
| POST | `/auth/register` | Register form |
| POST | `/auth/logout` | Header / account sign out |
| POST | `/auth/forgot-password` | Forgot password form |
| POST | `/auth/reset-password` | Reset password form |
| POST | `/auth/refresh` | Not wired — extension point only |

Current Identity login/register contracts accept **email + password only**.

Register does not return tokens. The UI redirects to `/login?registered=true` and does not auto-login.

Logout: UI sends the in-memory refresh token when present. If Gateway logout fails, local session is still cleared so the user is never stuck signed-in in the UI.

## Session / token storage

`apps/web/src/lib/auth/session.ts` is the only token store.

- Not `localStorage` / `sessionStorage`
- UI must not log access tokens, refresh tokens, or passwords
- Production target: Gateway `httpOnly`, `Secure`, `SameSite` cookies

`Remember me` is collected for a future cookie lifetime. It does not persist tokens in the browser today.

## Development mock

Set `NEXT_PUBLIC_AUTH_ADAPTER=mock` only when `NODE_ENV !== 'production'`. Production ignores this flag.

Documented fixtures (not production credentials):

| Email | Password | Result |
|-------|----------|--------|
| `customer@novacommerce.dev` | `Password8` | Success |
| `locked@novacommerce.dev` | any | Account unavailable |
| `limited@novacommerce.dev` | any | Rate limited |
| `existing@novacommerce.dev` | register | Conflict |

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
| `AccountSessionCard` | Authenticated session surface |

Navigation: `AccountMenu` in `SiteHeader` (desktop) and sheet actions (mobile).

## 401 vs 403

| HTTP / situation | UX |
|------------------|----|
| 401 / session required / expired | Sign in again. `/login?reason=session-expired` or `SessionExpiredState` |
| 403 / no permission | `/unauthorized` — Back / Home / Account. No role IDs or permission keys |

Do not show “You are not authorized” for every failure.

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
```

Covered: login/register validation and loading, password toggle, session status, sanitized return URLs, RequireAuth redirect, unauthorized actions, mock adapter isolation.

## Related documents

- [frontend-architecture.md](./frontend-architecture.md)
- [design-system.md](./design-system.md)
- [brand-guidelines.md](./brand-guidelines.md)
- [api-guidelines.md](./api-guidelines.md)
