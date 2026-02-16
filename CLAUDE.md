# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Internal tools app for Blindern Studenterhjem (foreningenbs.no/intern/). Monorepo with two services: a TanStack Start fullstack app and a Node.js calendar API.

## Architecture

- **App** (`app/`): TanStack Start (SPA mode), React, TypeScript, Vite, Hono server. Serves the SPA at `/intern/` and API routes at `/intern/api/`. Uses Drizzle ORM with PostgreSQL. Auth via SAML2. Server functions in `src/server-fns/`, server-only code in `src/server/`. Routes use TanStack Router file-based routing in `src/routes/`. Models use 24-char hex string IDs (MongoDB ObjectId format). React Query for data fetching, React Hook Form, Bootstrap Sass 3.
- **Calendar API** (`calendar-api/`): Elysia (Node.js), TypeScript. Aggregates Confluence + historical calendar data. Exposes JSON and iCalendar endpoints.

### App structure (`app/src/`)

- `routes/` — file-based routes (TanStack Router). API routes under `routes/api/`.
- `server-fns/` — server functions called from client via TanStack Start.
- `server/` — server-only code: database, auth, email, SAML2, session, env config.
- `hooks/` — React Query hooks wrapping server functions.
- `components/` — shared React components.
- `styles/` — SCSS stylesheets.
- `utils/` — shared utilities.

Auth integrates with an external Users API (`users-api.zt.foreningenbs.no`) via HMAC-authenticated requests for user/group management.

## Commands

Commands are run from each service's directory.

### App (`app/`)
```bash
pnpm install
pnpm dev                            # Dev server
docker compose up database          # PostgreSQL on :5432
pnpm build
pnpm lint                           # ESLint
pnpm lint:fix
pnpm typecheck
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
- Package manager: pnpm
- Docker images pushed to ghcr.io/blindern/intern-{app,calendar-api}
- CI runs per-service on push to respective directory (`.github/workflows/`)
- OpenTelemetry instrumentation via `--import ./instrumentation.ts`
