# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Layout

Monorepo with two independent apps:

- `api/` — NestJS backend, TypeScript, PostgreSQL via TypeORM
- `web-app/` — Angular 17 frontend, PrimeNG UI, Chart.js
- `database-setup/` — PostgreSQL init SQL
- `scripts/` — version bump and release tooling

## Commands

### API (`cd api`)

```bash
npm run start:dev          # dev server with hot-reload (port 3000)
npm run build              # production build
npm test                   # run all unit tests
npm test -- <file>.spec.ts # run single test file
npm run test:e2e           # e2e tests
npm run lint               # ESLint with auto-fix
npm run migration:generate # generate TypeORM migration
npm run migration:run      # apply migrations
npm run migration:revert   # revert last migration
```

Swagger UI at `http://localhost:3000/api`.

### Web App (`cd web-app`)

```bash
npm start                  # dev server (port 4200)
npm run build:prod         # production build
npm test                   # Karma unit tests
npm run lint               # ESLint
```

### Docker (repo root)

```bash
docker-compose up -d       # starts PostgreSQL (dev)
```

## Architecture

### API modules (`api/src/modules/`)

Each feature module is self-contained: `*.module.ts`, `*.controller.ts`, `*.service.ts`, `entities/`, `dto/`. Key modules:

- **auth** — JWT + Passport strategy; `JwtAuthGuard` and `JwtOrApiKeyAuthGuard` protect routes
- **transactions** — core CRUD + projections; `projections.service.ts` handles financial forecasting
- **recurring-transactions** — `*.scheduler.ts` runs via `@nestjs/schedule` to auto-create transactions
- **credit-cards** + **card-transactions** — credit card management with invoice cycle logic (`invoice.utils.ts`)
- **installments** — installment plans linked to card transactions
- **workspaces** + **invitations** — multi-user workspace sharing with email invitations
- **api-keys** — programmatic access via API key auth strategy

Common utilities in `api/src/common/`: `BaseEntity`, shared guards, decorators (`@GetUser()`), and date/invoice utils.

Configuration loaded from `.env` → `api/src/config/app.config.ts` and `database.config.ts`. Path aliases: `@common/*`, `@config/*`, `@modules/*`, `@entities/*`.

### Frontend structure (`web-app/src/app/`)

- `core/` — singleton services (`auth`, `api`, `transaction`, `category`, `dashboard`, `workspace`, `loading`), HTTP interceptors, route guards
- `features/` — lazy-loaded feature modules: `auth`, `transactions`, `categories`, `credit-cards`, `recurring-transactions`, `dashboard`, `settings`
- `layout/` — `MainLayoutComponent` wraps authenticated routes with sidebar/navbar
- `shared/` — reusable components (`MaskedCalendarComponent`), directives, and utils (date, form, format, icon, UI)

API base URL comes from `src/environments/environment.ts` → `environment.apiUrl`. Angular path aliases: `@core/*`, `@shared/*`, `@features/*`, `@layout/*`, `@env/*`.

Auth flow: `AuthInterceptor` attaches JWT from `StorageService` to every request; `ErrorInterceptor` handles 401s globally. `AuthGuard`/`GuestGuard` protect routes.

## Code Conventions

**Language:** Backend errors/logs in English; frontend UI text in Portuguese (pt-BR).

**Angular:** Use `inject()` function instead of constructor injection. Always `private readonly` for injected deps.

**NestJS services:** public CRUD methods → public business logic → private helpers.

**Entities:** extend `BaseEntity` (`api/src/common/entities/base.entity.ts`). Column order: simple columns → enums → relations.

**DTOs:** always decorate with `class-validator` and `@ApiProperty`.

**Observables:** suffix with `$`. Avoid `any` except `Record<string, any>`.

**Prettier config (both projects):** single quotes, trailing commas, 2-space indent, 100-char print width.

## Releases

Releases are automated via GitHub Actions (`Actions → 🏷️ Release Management`). Requires:
1. Content in `[Em Desenvolvimento]` section of `CHANGELOG.md`
2. Type: `patch` / `minor` / `major`
3. Confirmation text `CONFIRMAR`

The workflow bumps versions in `api/package.json`, `web-app/package.json`, and `web-app/src/environments/environment*.ts`.

Manual bump only: `node scripts/version-bump.js patch`.
