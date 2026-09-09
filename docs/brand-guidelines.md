# Brand Guidelines v1.0

> Last updated: 2026-09-09
> Status: Active

## Quick Reference

| Element | Value |
|---------|-------|
| Primary Color | #2563EB |
| Secondary Color | #7C3AED |
| Accent Color | #F97316 |
| Primary Font | Inter |
| Voice | Professional, Trustworthy, Clear, Customer-first |

---

## 1. Color Palette

### Primary Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Primary Blue | #2563EB | rgb(37,99,235) | CTAs, links, primary actions |
| Primary Dark | #1D4ED8 | rgb(29,78,216) | Hover states, emphasis |

### Secondary Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Nova Violet | #7C3AED | rgb(124,58,237) | Brand accents, highlights, AI features |
| Violet Dark | #6D28D9 | rgb(109,40,217) | Secondary hover states |

### Accent Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Commerce Orange | #F97316 | rgb(249,115,22) | Promotions, deals, urgency |
| Accent Green | #22C55E | rgb(34,197,94) | Success, positive states |

### Neutral Palette

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Background | #FFFFFF | rgb(255,255,255) | Page backgrounds |
| Surface | #F9FAFB | rgb(249,250,251) | Cards, sections |
| Text Primary | #111827 | rgb(17,24,39) | Headings, body text |
| Text Secondary | #6B7280 | rgb(107,114,128) | Captions, muted text |
| Border | #E5E7EB | rgb(229,231,235) | Dividers, borders |

### Semantic Colors

| State | Hex | Usage |
|-------|-----|-------|
| Success | #22C55E | Confirmations, completed orders |
| Warning | #F59E0B | Pending states, low stock |
| Error | #EF4444 | Errors, destructive actions |
| Info | #3B82F6 | Informational messages |

### Accessibility

- Text on white background: 7.2:1 contrast ratio (AAA)
- Primary on white: 4.6:1 contrast ratio (AA)
- All interactive elements meet WCAG 2.1 AA standards

---

## 2. Typography

### Font Stack

```css
--font-heading: 'Inter', system-ui, -apple-system, sans-serif;
--font-body: 'Inter', system-ui, -apple-system, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

### Type Scale

| Element | Size (Desktop) | Size (Mobile) | Weight | Line Height |
|---------|----------------|---------------|--------|-------------|
| H1 | 48px | 32px | 700 | 1.2 |
| H2 | 36px | 28px | 600 | 1.25 |
| H3 | 28px | 24px | 600 | 1.3 |
| H4 | 24px | 20px | 600 | 1.35 |
| Body | 16px | 16px | 400 | 1.5 |
| Body Large | 18px | 18px | 400 | 1.6 |
| Small | 14px | 14px | 400 | 1.5 |
| Caption | 12px | 12px | 400 | 1.4 |

### Font Loading

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

---

## 3. Logo Usage

### Variants

| Variant | File | Use Case |
|---------|------|----------|
| Full Horizontal | logo-full-horizontal.svg | Headers, documents |
| Stacked | logo-stacked.svg | Square spaces |
| Icon Only | logo-icon.svg | Favicons, app icons |
| Monochrome | logo-mono.svg | Limited color contexts |

### Clear Space

Minimum clear space = height of the logo icon (mark)

### Minimum Size

| Context | Minimum Width |
|---------|---------------|
| Digital - Full Logo | 120px |
| Digital - Icon | 24px |
| Print - Full Logo | 35mm |
| Print - Icon | 10mm |

### Don'ts

- Don't rotate or skew the logo
- Don't change colors outside approved palette
- Don't add shadows or effects
- Don't crop or modify proportions
- Don't place on busy backgrounds without sufficient contrast

---

## 4. Voice & Tone

### Brand Personality

| Trait | Description |
|-------|-------------|
| **Professional** | Enterprise-grade, reliable, technically competent |
| **Trustworthy** | Transparent pricing, honest product info, secure checkout |
| **Clear** | Direct communication, no jargon for shoppers |
| **Customer-first** | Help buyers and sellers succeed |

### Voice Chart

| Trait | We Are | We Are Not |
|-------|--------|------------|
| Professional | Expert, reliable | Stuffy, corporate |
| Trustworthy | Transparent, secure | Salesy, manipulative |
| Clear | Direct, concise | Vague, overly technical |
| Customer-first | Supportive, empowering | Patronizing |

### Tone by Context

| Context | Tone | Example |
|---------|------|---------|
| Marketing | Confident, benefit-focused | "Scale your store without scaling complexity." |
| Product UI | Clear, actionable | "Add to cart" / "View order details" |
| Error messages | Calm, solution-focused | "Payment failed. Try another method or contact support." |
| Success | Brief, reassuring | "Order confirmed! Track your shipment anytime." |
| Developer docs | Precise, instructional | "Run `pnpm install` to set up dependencies." |

### Prohibited Terms

| Avoid | Reason |
|-------|--------|
| Revolutionary | Overused |
| Best-in-class | Vague claim |
| Seamless | Overused |
| Synergy | Corporate jargon |
| Leverage | Use "use" instead |

---

## 5. Imagery Guidelines

### Photography Style

- **Lighting:** Natural, soft lighting preferred
- **Subjects:** Real products, authentic shopping scenarios
- **Color treatment:** Maintain brand colors in post
- **Composition:** Clean, product-focused

### Illustrations

- Style: Modern, flat design with subtle gradients
- Colors: Brand palette only (blue, violet, orange accents)
- Line weight: 2px consistent stroke
- Corners: 4px rounded

### Icons

- Style: Outlined, 24px base grid
- Stroke: 1.5px consistent
- Corner radius: 2px
- Fill: None (outline only)

---

## 6. Design Components

### Buttons

| Type | Background | Text | Border Radius |
|------|------------|------|---------------|
| Primary | #2563EB | #FFFFFF | 8px |
| Secondary | Transparent | #2563EB | 8px |
| Tertiary | Transparent | #6B7280 | 8px |
| Promo | #F97316 | #FFFFFF | 8px |

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Tight spacing |
| sm | 8px | Compact elements |
| md | 16px | Standard spacing |
| lg | 24px | Section spacing |
| xl | 32px | Large gaps |
| 2xl | 48px | Section dividers |

### Border Radius

| Element | Radius |
|---------|--------|
| Buttons | 8px |
| Cards | 12px |
| Inputs | 8px |
| Modals | 16px |
| Pills/Tags | 9999px |

---

## AI Image Generation

### Base Prompt Template

Always prepend to image generation prompts:

```
Modern enterprise e-commerce aesthetic, clean professional layout,
primary blue (#2563EB) and violet (#7C3AED) accents, commerce orange (#F97316) for highlights,
soft natural lighting, trustworthy and scalable brand feel
```

### Style Keywords

| Category | Keywords |
|----------|----------|
| **Lighting** | soft lighting, natural, bright |
| **Mood** | professional, trustworthy, modern |
| **Composition** | centered, clean, product-focused |
| **Treatment** | high contrast, crisp, vibrant accents |
| **Aesthetic** | enterprise e-commerce, SaaS marketplace |

### Visual Don'ts

| Avoid | Reason |
|-------|--------|
| Cluttered layouts | Conflicts with clean enterprise feel |
| Neon/oversaturated colors | Off-brand |
| Generic stock photo look | Reduces trust |

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-09-09 | Initial NovaCommerce brand guidelines |
