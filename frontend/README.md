# intern frontend

## Development

You need NodeJS and NPM.

1. Install dependencies

   ```bash
   npm ci
   ```

1. Start local server

   ```bash
   npm run dev
   ```

   By default this will go against the local backend. You can also run it directly
   against production backend:

   ```bash
   BACKEND_URL=https://foreningenbs.no/intern/ npm run dev
   ```

1. Check app

   http://localhost:3000
