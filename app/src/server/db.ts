import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./schema.js"
import { env } from "./env.js"

const client = postgres(env.databaseUrl)

export const db = drizzle(client, { schema })
