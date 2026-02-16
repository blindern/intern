import { defineConfig } from "drizzle-kit"

export default defineConfig({
  schema: "./src/server/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url:
      process.env.DATABASE_URL ??
      "postgres://intern:secret@localhost:5432/intern",
  },
})
