# NovaCommerce — Agent Instructions

> Project-specific guidance for AI agents working in this repository.
> Architecture rules live in `.cursor/rules/novacommerce.mdc` (always applied).

## Project Overview

**NovaCommerce** is an enterprise e-commerce platform (Modular Monolith → Event-Driven → Microservices).

- **Stack:** NestJS + Prisma + PostgreSQL (backend), Next.js + React + Tailwind (frontend), Python/FastAPI (AI)
- **Architecture:** Clean Architecture, DDD, Outbox Pattern, CQRS where needed
- **Status:** Planning phase — see `docs/progress.md`

## Key Documentation

| Document | Purpose |
|----------|---------|
| `docs/Project Context.md` | Vision, principles, module boundaries |
| `docs/NovaCommerce Architecture.md` | System architecture |
| `docs/techContext.md` | Technology choices |
| `docs/progress.md` | Development progress tracker |
| `docs/brand-guidelines.md` | Brand voice, colors, typography |
| `assets/design-tokens.json` | Design token source of truth |
| `assets/design-tokens.css` | CSS variables (auto-generated) |

## Working Conventions

1. Read relevant docs before making architectural changes.
2. Follow module structure: `application/`, `domain/`, `infrastructure/`, `presentation/`, `contracts/`, `events/`.
3. One module owns one bounded context — no cross-module database access.
4. Emit domain events for important business actions; publish via Outbox only.
5. Keep diffs focused — do not refactor unrelated code.
6. Match existing naming: kebab-case files, PascalCase classes, `I`-prefixed interfaces.

## Design & Brand

For UI/brand work, use skills in `.cursor/skills/`:

- `ui-ux-pro-max` — UI/UX intelligence and design system search
- `ui-styling` — Tailwind + shadcn/ui patterns
- `brand` — brand voice and asset validation
- `design-system` — token architecture and slides

Sync brand changes:

```bash
node .cursor/skills/brand/scripts/sync-brand-to-tokens.cjs
node .cursor/skills/design-system/scripts/generate-tokens.cjs --config assets/design-tokens.json -o assets/design-tokens.css
```

## What Not To Do

- Do not break Clean Architecture dependency direction.
- Do not put business logic in controllers, DTOs, or repositories.
- Do not call LLMs directly from business modules.
- Do not search PostgreSQL for user-facing product search (use OpenSearch).
- Do not commit secrets, `.env` files, or credentials.
- Do not create commits or PRs unless explicitly asked.
