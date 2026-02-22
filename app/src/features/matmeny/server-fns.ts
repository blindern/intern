import { AppError } from "../../server/errors.js"

import { createServerFn } from "@tanstack/react-start"
import { between, eq } from "drizzle-orm"
import { db } from "../../server/db.js"
import { toISODateString } from "../../server/dates.js"
import { matmeny } from "../../server/schema.js"
import { generateId } from "../../server/id.js"
import { getCurrentUser } from "../../server/get-current-user.js"
import { hasGroupAccess } from "../../server/auth.js"
import { tracingMiddleware } from "../../server/tracing.js"
import { execFile } from "node:child_process"
import { writeFile, unlink } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"

function defaultDateRange() {
  const now = new Date()
  // Get Monday of current ISO week
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1)

  const monday = new Date(now)
  monday.setDate(diff)

  const from = new Date(monday)
  from.setDate(from.getDate() - 7) // previous week Monday

  const to = new Date(monday)
  to.setDate(to.getDate() + 13) // next week Sunday

  return {
    from: toISODateString(from),
    to: toISODateString(to),
  }
}

export const getMatmeny = createServerFn({ method: "GET" })
  .middleware([tracingMiddleware])
  .inputValidator((input: { from?: string; to?: string }) => input)
  .handler(async ({ data }) => {
    const range =
      data.from && data.to
        ? { from: data.from, to: data.to }
        : defaultDateRange()

    return db
      .select({
        day: matmeny.day,
        text: matmeny.text,
        dishes: matmeny.dishes,
      })
      .from(matmeny)
      .where(between(matmeny.day, range.from, range.to))
      .orderBy(matmeny.day)
  })

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
const ANTIWORD_TIMEOUT_MS = 10_000 // 10 seconds

export const convertMatmenyFile = createServerFn({
  method: "POST",
})
  .middleware([tracingMiddleware])
  .inputValidator((input: { fileBase64: string }) => input)
  .handler(async ({ data }) => {
    const user = await getCurrentUser()
    if (
      !user ||
      !(
        hasGroupAccess(user, "admin") ||
        hasGroupAccess(user, "ansatt") ||
        hasGroupAccess(user, "kollegiet")
      )
    ) {
      throw new AppError("Forbidden")
    }

    if (!data.fileBase64) {
      throw new AppError("No file uploaded")
    }

    const buffer = Buffer.from(data.fileBase64, "base64")
    if (buffer.length > MAX_FILE_SIZE) {
      throw new AppError("File too large")
    }

    const tempPath = join(tmpdir(), `bs-intern-matmeny-${Date.now()}`)
    await writeFile(tempPath, buffer)

    try {
      const text = await new Promise<string>((resolve, reject) => {
        const proc = execFile(
          "antiword",
          ["-w", "0", tempPath],
          { timeout: ANTIWORD_TIMEOUT_MS },
          (err, stdout) => {
            if (err) reject(err as Error)
            else resolve(stdout)
          },
        )
        proc.stdin?.end()
      })

      if (!text) {
        throw new Error("antiword produced no output")
      }

      return parseMatmenyText(text)
    } finally {
      await unlink(tempPath).catch(() => {})
    }
  })

export const storeMatmeny = createServerFn({ method: "POST" })
  .middleware([tracingMiddleware])
  .inputValidator(
    (input: {
      days: {
        day: string
        dishes?: string[] | null
        text?: string | null
      }[]
    }) => input,
  )
  .handler(async ({ data }) => {
    const user = await getCurrentUser()

    // Check access: logged-in admin/ansatt/kollegiet
    const canEdit =
      user &&
      (hasGroupAccess(user, "admin") ||
        hasGroupAccess(user, "ansatt") ||
        hasGroupAccess(user, "kollegiet"))

    if (!canEdit) {
      throw new AppError("Forbidden")
    }

    if (!Array.isArray(data.days)) {
      throw new AppError("Invalid format")
    }

    const result = []

    for (const day of data.days) {
      if (!day.day || !/^\d{4}-\d{2}-\d{2}$/.test(day.day)) {
        throw new AppError("Invalid date format")
      }

      const isEmpty = (!day.dishes || day.dishes.length === 0) && !day.text

      const existing = await db
        .select()
        .from(matmeny)
        .where(eq(matmeny.day, day.day))
        .limit(1)

      if (isEmpty) {
        // Delete if exists
        if (existing.length > 0) {
          await db.delete(matmeny).where(eq(matmeny.id, existing[0].id))
        }
        continue
      }

      if (existing.length > 0) {
        // Update
        const [updated] = await db
          .update(matmeny)
          .set({
            dishes: day.dishes ?? null,
            text: day.text ?? null,
            updatedAt: new Date(),
          })
          .where(eq(matmeny.id, existing[0].id))
          .returning()
        result.push(updated)
      } else {
        // Insert
        const [inserted] = await db
          .insert(matmeny)
          .values({
            id: generateId(),
            day: day.day,
            dishes: day.dishes ?? null,
            text: day.text ?? null,
          })
          .returning()
        result.push(inserted)
      }
    }

    return result
  })

/**
 * Parse antiword output into weekly menu days.
 * Expects a table with Norwegian day names as delimiters.
 */
function parseMatmenyText(text: string): Record<number, string[]> {
  const dayNames = "(Mandag|Tirsdag|Onsdag|Torsdag|Fredag|Lørdag|Søndag)"
  const parts = text.split(new RegExp(dayNames, "u"))

  if (parts.length !== 15) {
    throw new Error(`Expected 15 parts, got ${parts.length}`)
  }

  const result: Record<number, string[]> = {}
  let dayId = 1

  for (let i = 1; i < parts.length; i += 2) {
    const content = parts[i + 1]
    result[dayId++] = parseDayContent(content)
  }

  return result
}

function parseDayContent(content: string): string[] {
  const matches = content.matchAll(/^(\s+|\|\s+)\|(.+?)\s+\|/gmu)
  const result: string[] = []

  for (const match of matches) {
    let row = match[2].trim()
    if (!row) continue

    // If all uppercase, normalize to first-char uppercase
    if (row === row.toUpperCase()) {
      row = row.charAt(0) + row.slice(1).toLowerCase()
    }

    result.push(row)
  }

  return result
}
