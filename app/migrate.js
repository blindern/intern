import { drizzle } from "drizzle-orm/postgres-js"
import { migrate } from "drizzle-orm/postgres-js/migrator"
import postgres from "postgres"

const databaseUrl =
  process.env.DATABASE_URL ?? "postgres://intern:secret@localhost:5432/intern"

const client = postgres(databaseUrl, { max: 1 })
const db = drizzle(client)

// If the database already has tables (e.g. from Laravel) but no Drizzle
// migrations table, baseline the initial migration to avoid CREATE TABLE
// failures on already-existing tables.
// drizzle-orm 0.44+ stores migrations in the "drizzle" schema.
await client`CREATE SCHEMA IF NOT EXISTS "drizzle"`

const [hasDrizzleTable] = await client`
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'drizzle' AND table_name = '__drizzle_migrations'
  ) AS exists
`

if (!hasDrizzleTable.exists) {
  const [hasExistingTables] = await client`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'books'
    ) AS exists
  `

  if (hasExistingTables.exists) {
    console.log("Existing database detected, baselining Drizzle migrations...")
    await client`
      CREATE TABLE "drizzle"."__drizzle_migrations" (
        id SERIAL PRIMARY KEY,
        hash text NOT NULL,
        created_at bigint
      )
    `
    await client`
      INSERT INTO "drizzle"."__drizzle_migrations" (hash, created_at)
      VALUES ('0000_nice_la_nuit', ${Date.now()})
    `
    console.log("Baseline complete")
  }
}

console.log("Running migrations...")
await migrate(db, { migrationsFolder: "./drizzle" })
console.log("Migrations complete")

await client.end()
