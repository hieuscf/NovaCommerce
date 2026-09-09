# Contributing to NovaCommerce

> **Version:** 1.0  
> **Last Updated:** 2026-09-09  
> **Status:** Foundation Phase  
> **Related:** [coding-standards.md](./coding-standards.md), [README.md](../README.md)

Thank you for contributing to NovaCommerce. This guide covers workflow, branching, commits, and pull requests.

---

## 1. Contribution Flow

```text
Issue / Task
    ↓
Create Branch (from master)
    ↓
Read Required Docs (docs/README.md)
    ↓
Implement
    ↓
Build / Typecheck
    ↓
Commit
    ↓
Push
    ↓
Pull Request → master
    ↓
Review
    ↓
Merge
```

> **CI:** GitHub Actions workflows are **not configured yet**. Verification is manual until CI is added. Do not assume automated checks run on PRs.

---

## 2. Before Coding

Read the [Task-Based Reading Guide](./README.md#task-based-reading-guide) in `docs/README.md` for your task type.

Answer these architecture questions before implementation:

1. Which bounded context does this feature belong to?
2. What is the Aggregate Root?
3. Does it emit a Domain Event?
4. Does it require Outbox?
5. Does it need CQRS (Search / Analytics / Reporting only)?
6. Does it need caching?
7. Does it need a search index (OpenSearch)?
8. Does it need AI processing (Python service)?
9. Can this module be extracted as a microservice later without domain rewrites?
10. Does the design violate Clean Architecture?

If any answer is unclear, discuss in the issue or PR before large implementations.

---

## 3. Implementation

All business features belong in exactly one module:

```text
modules/<bounded-context>/
├── application/
├── domain/
├── infrastructure/
└── presentation/
```

Do **not** put business logic in:

```text
apps/gateway/          (routing, auth, rate limit only)
packages/building-blocks/   (technical abstractions only)
packages/database/          (Prisma infrastructure only)
```

Follow [coding-standards.md](./coding-standards.md) and [reponsitory-structure.md](./reponsitory-structure.md).

---

## 4. Verification

Run checks appropriate to your changes. Only commands that **exist in the repository** are listed below.

### Install dependencies

```bash
pnpm install
```

### Build (TypeScript compile / NestJS / Next.js)

```bash
# All apps, workers, and packages
pnpm build

# Individual targets
pnpm build:gateway
pnpm build:web
pnpm build:admin
pnpm build:worker
pnpm --filter @novacommerce/building-blocks run build
pnpm --filter @novacommerce/database run build
```

Type checking is performed as part of each package's `build` script (`tsc`, `nest build`, or `next build`).

### Local development servers

```bash
pnpm --filter @novacommerce/gateway run start:dev
pnpm --filter @novacommerce/web run dev
pnpm --filter @novacommerce/admin run dev
```

### Database

```bash
pnpm db:generate
pnpm db:migrate:deploy
```

### Infrastructure (Docker)

```bash
cp .env.example .env
docker compose -f docker-compose.dev.yml up -d    # infra only
docker compose up -d                               # full stack
```

See [docker.md](./docker.md) for full Docker workflow.

### Not available yet

The following are **planned** but not configured at repository root:

```text
pnpm lint          ← no root lint script
pnpm test          ← no test runner configured
pnpm typecheck     ← use pnpm build instead
GitHub Actions CI  ← no .github/workflows/
```

Document manual verification in your PR until CI and test infrastructure exist.

---

## 5. Documentation

Update documentation when your change affects:

| Change type | Update |
|-------------|--------|
| Architecture / module boundaries | `NovaCommerce Architecture.md`, ADR if significant |
| Domain model | `domain-model.md` |
| Database schema | `database-design.md`, Prisma schema |
| Events | `event-catalog.md` |
| API | `api-guidelines.md`, Swagger/OpenAPI |
| Repository layout | `reponsitory-structure.md` |
| Progress / status | `progress.md` |

Significant design decisions require an ADR in `docs/architecture/adrs/`.

---

## 6. Branch Strategy

### Default branch

```text
master
```

`origin/HEAD` points to `master`. All pull requests target **`master`**.

> A local `main` branch may exist historically — use `master` as the integration branch.

### Branch naming

Create a dedicated branch for every change. Use lowercase kebab-case:

```text
master
  ↑
feature/<short-description>
fix/<short-description>
docs/<short-description>
refactor/<short-description>
chore/<short-description>
```

**Examples:**

```text
feature/catalog-product-aggregate
fix/order-state-validation
docs/coding-standards
refactor/building-blocks-result
chore/update-dependencies
```

### Rules

- `master` must remain mergeable at all times
- Do not commit directly to `master` — use pull requests
- One logical change per branch
- Keep branch names short and intent-focused
- Delete branch after merge

### Create a branch

```bash
git checkout master
git pull origin master
git checkout -b feature/my-feature
```

---

## 7. Commit Conventions

NovaCommerce uses **[Conventional Commits](https://www.conventionalcommits.org/)** for new work.

### Format

```text
type(scope): short imperative description
```

### Types

| Type | Use for |
|------|---------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `refactor` | Code change without feature/fix |
| `test` | Tests |
| `chore` | Tooling, deps, maintenance |
| `build` | Build system changes |
| `ci` | CI configuration |
| `perf` | Performance improvement |
| `revert` | Revert a prior commit |

### Scope

Use the module, app, or package name:

```text
catalog, order, gateway, building-blocks, database, docs, docker
```

### Examples

```text
feat(catalog): add product aggregate
fix(order): validate order state transition
docs(architecture): update module boundaries
refactor(building-blocks): simplify result type
test(catalog): add product aggregate unit tests
chore(deps): update prisma to 6.5.0
build(gateway): add swagger module
```

### Rules

- Subject line ≤ 72 characters
- Imperative mood: "add" not "added" or "adds"
- No period at end of subject
- Body optional — explain **why** when not obvious
- Breaking changes: add `BREAKING CHANGE:` in footer or `!` after type/scope

```text
feat(api)!: rename order endpoint response shape

BREAKING CHANGE: order response now uses `items` instead of `lineItems`
```

> Early repository commits predate this convention. New commits should follow Conventional Commits.

---

## 8. Pull Requests

### Target branch

All PRs target **`master`**.

Use the template at `.github/PULL_REQUEST_TEMPLATE.md`. Fill in every relevant section.

### Requirements

Before requesting review:

- [ ] Code follows [coding-standards.md](./coding-standards.md)
- [ ] Correct bounded context — no cross-module internal dependencies
- [ ] Domain remains framework-independent
- [ ] Events/contracts used where required; Outbox considered for domain events
- [ ] Documentation updated if architecture/domain/API/DB/events changed
- [ ] Swagger/OpenAPI updated if API changed
- [ ] No secrets, credentials, or `.env` files committed
- [ ] Build passes for affected packages (`pnpm build` or scoped build)
- [ ] Manual verification documented in PR

### Review criteria

Reviewers check:

- Clean Architecture compliance
- Module boundary respect
- No direct cross-module database access
- Appropriate tests (when test infrastructure exists)
- No unnecessary abstraction or over-engineering

### After merge

- Delete the feature branch
- Update `docs/progress.md` if sprint/milestone status changed

---

## 9. Code of Conduct

- Respect architecture decisions documented in ADRs
- Prefer small, reviewable PRs over large bundled changes
- Report doc/code conflicts rather than silently overriding either
- Ask questions in issues or PR comments when requirements are unclear

---

## Related Documents

| Document | Purpose |
|----------|---------|
| [coding-standards.md](./coding-standards.md) | Architecture and code rules |
| [README.md](../README.md) | Project overview and quick start |
| [docker.md](./docker.md) | Local Docker environment |
| [progress.md](./progress.md) | Current implementation status |
| `.github/PULL_REQUEST_TEMPLATE.md` | PR checklist template |
