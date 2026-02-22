# App

TanStack Start (SPA mode) fullstack app. Serves the SPA at `/intern/` and API routes at `/intern/api/`.

## Local development

```bash
# Start PostgreSQL
docker compose up -d database

# Install dependencies
pnpm install

# Set up environment (USERS_API_KEY and SESSION_SECRET are required)
cp .env.example .env
# Edit .env and fill in USERS_API_KEY and SESSION_SECRET

# Push database schema
pnpm drizzle-kit push

# Start dev server
pnpm dev
```

The app will be available at http://localhost:5173/intern/.

To work on the frontend without a local database, proxy server calls to production:

```bash
PROXY_API=https://foreningenbs.no pnpm dev
```

## Commands

```bash
pnpm dev          # Dev server
pnpm build        # Production build
pnpm start        # Start production server (after build)
pnpm lint         # ESLint
pnpm lint:fix     # ESLint with auto-fix
pnpm typecheck    # TypeScript type checking
pnpm test:e2e     # Playwright e2e tests (against production by default)
```

## E2e tests

Tests run against `https://foreningenbs.no` by default. Override with `BASE_URL`:

```bash
FBS_TEST_USERNAME=<user> FBS_TEST_PASSWORD=<pass> pnpm test:e2e
```
