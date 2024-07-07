# intern frontend

## Development

You need NodeJS and [PNPM](https://pnpm.io/installation).

1. Install dependencies

   ```bash
   pnpm install
   ```

1. Start local server

   ```bash
   pnpm run dev
   ```

   By default this will go against the local backend. You can also run it directly
   against production backend:

   ```bash
   BACKEND_URL=https://foreningenbs.no/intern/ pnpm run dev
   ```

1. Check app

   http://localhost:3000
