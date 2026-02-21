import { createServerFn } from "@tanstack/react-start"
import { eq } from "drizzle-orm"
import { db } from "../../server/db.js"
import { bukker } from "../../server/schema.js"
import { generateId } from "../../server/id.js"
import { authMiddleware, hasGroupAccess } from "../../server/auth.js"
import { tracingMiddleware } from "../../server/tracing.js"

interface Award {
  year: string
  rank: "Halv" | "Hel" | "Høy"
  image_file?: string
  devise?: string
  comment?: string
}

interface BukkPublic {
  id: string
  name: string
  died: string | boolean | null
  awards: {
    year: string
    rank: string
    image_preview_url: string | null
    devise?: string
    comment?: string
  }[]
}

function formatBukk(row: typeof bukker.$inferSelect): BukkPublic {
  const rawAwards = row.awards ?? []
  return {
    id: row.id,
    name: row.name,
    died: row.died === "true" ? true : row.died,
    awards: rawAwards.map((a) => ({
      year: a.year,
      rank: a.rank,
      image_preview_url: a.image_file
        ? `https://foreningenbs.no/intern/assets/images/bukker/preview/${a.image_file}`
        : null,
      devise: a.devise,
      comment: a.comment,
    })),
  }
}

export const getBukker = createServerFn({ method: "GET" })
  .middleware([tracingMiddleware])
  .handler(async () => {
    const rows = await db.select().from(bukker)
    return rows.map(formatBukk)
  })

export const getBukk = createServerFn({ method: "GET" })
  .middleware([tracingMiddleware])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    const [row] = await db.select().from(bukker).where(eq(bukker.id, data.id))
    if (!row) throw new Error("Not found")
    return formatBukk(row)
  })

export const createBukk = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(
    (input: {
      name: string
      died?: string | boolean | null
      awards?: Award[]
    }) => input,
  )
  .handler(async ({ data, context }) => {
    if (!hasGroupAccess(context.user, "bukkekollegiet")) {
      throw new Error("Forbidden")
    }

    validateAwards(data.awards)

    const id = generateId()
    const [row] = await db
      .insert(bukker)
      .values({
        id,
        name: data.name,
        died: normalizeDied(data.died),
        awards: data.awards ?? [],
      })
      .returning()

    return formatBukk(row)
  })

export const updateBukk = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(
    (input: {
      id: string
      name: string
      died?: string | boolean | null
      awards?: Award[]
    }) => input,
  )
  .handler(async ({ data, context }) => {
    if (!hasGroupAccess(context.user, "bukkekollegiet")) {
      throw new Error("Forbidden")
    }

    validateAwards(data.awards)

    const updates: Record<string, any> = {
      name: data.name,
      updatedAt: new Date(),
    }

    if (data.died !== undefined) {
      updates.died = normalizeDied(data.died)
    }

    if (data.awards !== undefined) {
      updates.awards = data.awards
    }

    const [row] = await db
      .update(bukker)
      .set(updates)
      .where(eq(bukker.id, data.id))
      .returning()

    if (!row) throw new Error("Not found")
    return formatBukk(row)
  })

export const deleteBukk = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    if (!hasGroupAccess(context.user, "bukkekollegiet")) {
      throw new Error("Forbidden")
    }

    const result = await db
      .delete(bukker)
      .where(eq(bukker.id, data.id))
      .returning({ id: bukker.id })

    if (result.length === 0) throw new Error("Not found")
    return { deleted: true }
  })

function normalizeDied(
  died: string | boolean | null | undefined,
): string | null {
  if (died === true) return "true"
  if (died === false || died === null || died === undefined) return null
  return died
}

function validateAwards(awards?: Award[]) {
  if (!awards) return
  for (const award of awards) {
    if (!/^\d{4}$/.test(award.year)) {
      throw new Error("Invalid award year")
    }
    if (!["Halv", "Hel", "Høy"].includes(award.rank)) {
      throw new Error("Invalid award rank")
    }
  }
}
