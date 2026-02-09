# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Internal tools app for Blindern Studenterhjem (foreningenbs.no/intern/). Monorepo with three independent services: PHP Laravel backend, React frontend, and Node.js calendar API.

## Architecture

- **Backend** (`backend/`): Laravel, PHP, MongoDB. REST API at `/intern/api/`. Custom domain code under `app/src/` (PSR-4: `Blindern\Intern\`), standard Laravel code under `app/`. Auth via SAML2.
- **Frontend** (`frontend/`): React, TypeScript, Vite. SPA served at `/intern/`. Feature modules in `src/modules/`, each with own routes. Uses React Query, React Hook Form, styled-components, Bootstrap Sass 3.
- **Calendar API** (`calendar-api/`): Elysia (Node.js), TypeScript. Aggregates Confluence + historical calendar data. Exposes JSON and iCalendar endpoints.

## Commands

Commands are run from each service's directory.

### Frontend (`frontend/`)
```bash
pnpm install
pnpm dev                            # Dev server on :3000
BACKEND_URL=https://foreningenbs.no/intern/ pnpm dev  # Against prod backend
pnpm build
pnpm lint                           # ESLint
pnpm lint:fix
```

### Backend (`backend/`)
```bash
composer install
docker compose up database          # MongoDB on :27017
php artisan serve --port 8081
php artisan test                    # PHPUnit
php artisan test --filter=TestName  # Single test
```

### Calendar API (`calendar-api/`)
```bash
pnpm install
pnpm serve                          # Server on :8000
pnpm lint
pnpm typecheck
pnpm test                           # Vitest
pnpm test src/some-file.test.ts     # Single test
```

## Conventions

- 2-space indentation, LF line endings, UTF-8 (see `.editorconfig`)
- Frontend uses path aliases: `components`, `layout`, `modules`, `urls`, `utils` (configured in `vite.config.ts`)
- Package manager for JS/TS services: pnpm
- Backend routes prefixed with `/intern/api` (see `routes/app.php`)
- Docker images pushed to ghcr.io/blindern/intern-{backend,frontend,calendar-api}
- CI runs per-service on push to respective directory (`.github/workflows/`)
