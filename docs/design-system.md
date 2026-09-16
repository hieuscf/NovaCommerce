# NovaCommerce Design System

> Version: 1.0  
> Last updated: 2026-09-16  
> Status: Active — Web v1 foundation

## Visual Philosophy

NovaCommerce UI expresses **Premium Modern Commerce + Soft Glass + 3D Product Experience**.

- Hierarchy over decoration
- Clarity over novelty
- Conversion over visual noise
- Consistency over page-level creativity
- Accessibility over animation
- Performance over visual effects

The customer web storefront uses airy layouts, soft glass navigation, indigo–violet gradients as accents, and Three.js as progressive enhancement. Admin shares tokens but uses a denser, operations-oriented layout.

## Architecture

```
packages/ui/          → Tokens, Tailwind theme, shadcn primitives
apps/web/             → Storefront layout, commerce & marketing components
apps/admin/           → Admin shell, data-dense operational UI
assets/design-tokens.* → Canonical token source (sync with packages/ui)
```

### Data Boundaries

```
API DTO → Adapter/Mapper → UI View Model → Component
```

UI components must not import backend domain entities or access databases directly.

## Color System

| Token | Value | Usage |
|-------|-------|-------|
| `--color-background` | `#F7F9FC` | Page background |
| `--color-background-secondary` | `#EEF3FA` | Alternate sections |
| `--color-surface` | `#FFFFFF` | Cards, panels |
| `--color-surface-subtle` | `#F8FAFD` | Image wells |
| `--color-foreground` | `#0B1F3A` | Primary text |
| `--color-muted-foreground` | `#64748B` | Secondary text |
| `--color-border` | `#E2E8F0` | Borders |
| `--color-primary` | `#4F46E5` | Primary actions (`brand`) |
| `--color-primary-soft` | `#6366F1` | CTA gradient end (`brand/soft`) |
| `--color-primary-tint` | `#EEF0FF` | Soft icon wells (`brand/tint`) |
| `--color-primary-strong` | `#4338CA` | Primary hover |
| `--color-ink` | `#0F172B` | Homepage headlines (Ebony) |
| `--color-copy` | `#45556C` | Hero/body supporting copy (Fiord) |
| `--color-secondary` | `#7C3AED` | Brand accent |
| `--color-accent-cyan` | `#38BDF8` | Ambient highlights |
| `--color-dark-surface` | `#0B162A` | Dark promo sections |

Gradients are accents only:

- **Hero CTA:** `linear-gradient(135deg, #4F46E5, #7C3AED)`
- **Pill CTA:** `linear-gradient(95deg, #4F46E5, #6366F1)` — `bg-gradient-cta`
- **Hero highlight word:** `linear-gradient(95deg, #6366F1, #8B5CF6)`
- **Ambient:** soft indigo/cyan/violet at low opacity
- **Page canvas:** `#F7F9FC` → `#F3F5FA` plus corner glows (`bg-page-canvas`)
- **Hero panel:** `#DFE7F5` → `#F6F8FC` (`bg-hero-panel`)
- **Offer rail:** `#F4F7FF` → `#E7E5FF` (`bg-offer-rail`)

## Typography

Font: **Inter** (via Next.js `next/font/google`)

| Scale | Desktop | Usage |
|-------|---------|-------|
| Hero | 56–72px | Homepage hero |
| H1 | 40–48px | Page titles |
| H2 | 32–40px | Section titles |
| H3 | 24–30px | Card titles |
| Body | 14–16px | Default text |
| Small | 12–14px | Meta, captions |

Weights: 400, 500, 600, 700, 800 — extra-bold is reserved for homepage hero/offer headlines.

## Radius

| Token | Value |
|-------|-------|
| sm | 8px |
| md | 12px |
| lg | 16px |
| xl | 20px |
| 2xl | 24px |
| pill | 9999px |

Default cards: 16–20px. Buttons: 10–14px.

## Shadows

| Token | Value |
|-------|-------|
| sm | `0 1px 2px rgba(15,23,42,0.04)` |
| md | `0 8px 24px rgba(15,23,42,0.06)` |
| lg | `0 20px 50px rgba(15,23,42,0.08)` |
| premium | `0 24px 80px rgba(15,23,42,0.12)` |
| cta | `0 12px 24px -12px rgba(79,70,229,0.7)` |
| card-soft | `0 16px 34px -28px rgba(15,23,42,0.45)` |
| rail | `0 18px 40px -26px rgba(15,23,42,0.35)` |

## Glassmorphism

Use selectively on navigation, hero overlays, and floating cards:

```css
background: rgba(255,255,255,0.72);
backdrop-filter: blur(20px);
border: 1px solid rgba(255,255,255,0.5);
```

## Components

### Package: `@novacommerce/ui`

shadcn/ui foundation, customized for NovaCommerce:

- Button, Card, Badge, Input, Label, Separator, Skeleton
- Avatar, Tabs, Sheet, Tooltip, EmptyState, ErrorState, NotFoundState, PermissionDeniedState, Container
- NovaCommerceLogo — rounded N mark + wordmark (header, auth, admin, footer; matches Alloy storefront)

### App: `apps/web`

- **Layout:** `StorefrontLayout`, `SiteHeader` (64px glass topbar, pill search), `SiteFooter` (newsletter bar + link columns)
- **Commerce:** `ProductCard` (`default` | `compact` | `featured` | `listing` | `row`), `CategoryCard` (`default` | `compact`), `ProductGrid` (homepage rails), Alloy product listing (`ProductListing` — breadcrumb, filter sidebar with counts/price range, toolbar grid/list + sort, 2/3/4-column grid or list rows, pagination, empty/skeleton/error, trust bar). Routes: `/shop` and `/shop/[category]`. Catalog photos until Gateway. Product detail (`ProductDetailPage` — gallery, variant/quantity selectors, details tabs, reviews, related products, loading/not-found/error; mock catalog until Gateway), cart (`CartPage` — line items, quantity/remove, order summary, recommendations, empty/skeleton/error; mock cart until Gateway), checkout (`CheckoutPage` — customer/shipping, Alloy Payment Gateway with card/OTP + wallet tiles, order summary, review; mock cart/customer until Gateway; does not invent Payment APIs; visual methods map to Gateway `paymentProvider`; place order navigates to `/orders/confirmed`), orders (`OrderListPage` / `OrderDetailPage` / `OrderConfirmedPage` — list filters/pagination, timeline, items, totals, loading/error; mock orders until Gateway; fulfillment labels are presentation-only, not domain `OrderStatus`)
- **Marketing:** Hero, SpecialOfferRail, ServiceBenefits, CategorySection, FeaturedProducts, DarkPromo, Trending, AI Discovery
- **Homepage canvas (`1920w light`):** wide container, hero + 264px offer rail, then guarantees/categories/featured + dark promo rail
- **Hero art:** CSS `HeroArt` cluster on the homepage (matches the Alloy storefront prototype). `HeroProductScene` remains available as Three.js progressive enhancement elsewhere.
- **Login / Register:** Alloy split layout — `AuthSplitShell` + `LoginPodiumArt` (visual aside, form card, social row). Auth logic stays on `LoginForm` / `RegisterForm` / `authClient`.
- **Merch shots:** compact category/product cards use `ProductShape` clay illustrations; shop listing still uses catalog photos.

### App: `apps/admin`

- **Layout:** `AdminShell` — sidebar + topbar, mobile sheet nav
- Denser spacing, operational cards, shared tokens

## Three.js Strategy

Three.js is **progressive enhancement only**:

| Viewport | Behavior |
|----------|----------|
| Desktop | Floating product scene in hero |
| Mobile | Static product composition |
| Reduced motion | Static fallback |

Never replace buttons, forms, navigation, or accessibility-critical UI with Three.js.

## Responsive Breakpoints

| Name | Range |
|------|-------|
| Mobile | 320–639px |
| Tablet | 640–1023px |
| Desktop | 1024–1439px |
| Large | 1440px+ |

Mobile navigation uses Sheet/drawer. Header compacts to logo + search + cart + menu.

## Accessibility

Target WCAG 2.2 AA:

- Semantic HTML, keyboard navigation, visible focus rings
- `aria-label` on icon buttons
- `prefers-reduced-motion` respected
- Minimum touch target 44px on interactive elements

## Animation

Library: **Motion** (web app)

- Default: 150–250ms
- Premium: 250–450ms
- GPU-friendly transforms only
- No constant floating or bouncing

## Token Migration (v0 → v1)

| Previous | v1 Commerce | Notes |
|----------|-------------|-------|
| Primary `#2563EB` | `#4F46E5` | Indigo for premium commerce feel |
| Background `#F9FAFB` | `#F7F9FC` | Cooler blue-grey |
| Foreground `#111827` | `#0B1F3A` | Navy text |
| Accent orange | Cyan/blue accents | Orange retained for promo badges only |

Brand guidelines primary blue remains documented; UI semantic primary shifted to indigo per commerce visual reference.

## Related Documents

- [brand-guidelines.md](./brand-guidelines.md)
- [assets/design-tokens.json](../assets/design-tokens.json)
- [packages/ui/README.md](../packages/ui/README.md)
