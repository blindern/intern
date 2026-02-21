import { createServerFn } from "@tanstack/react-start"
import { and, desc, eq, ilike, or, sql } from "drizzle-orm"
import { db } from "../../server/db.js"
import { books } from "../../server/schema.js"
import { generateId } from "../../server/id.js"
import { authMiddleware, hasGroupAccess } from "../../server/auth.js"
import { tracingMiddleware } from "../../server/tracing.js"
import { env } from "../../server/env.js"

export interface BookInput {
  title: string
  subtitle?: string | null
  authors?: string[] | null
  pubdate?: string | null
  description?: string | null
  isbn?: string | null
  bib_comment?: string | null
  bib_room?: string | null
  bib_section?: string | null
}

export const getBooks = createServerFn({ method: "GET" })
  .middleware([tracingMiddleware])
  .inputValidator((input: { page?: number; q?: string }) => input)
  .handler(async ({ data }) => {
    const page = data.page ?? 1
    const limit = 100
    const offset = (page - 1) * limit

    const conditions: any[] = []

    if (data.q) {
      const parts = data.q.trim().split(/\s+/)
      for (const part of parts) {
        const pattern = `%${part}%`
        conditions.push(
          or(
            ilike(books.title, pattern),
            ilike(books.subtitle, pattern),
            sql`${books.authors}::text ilike ${pattern}`,
            ilike(books.pubdate, pattern),
            ilike(books.isbn, pattern),
            ilike(books.bibBarcode, pattern),
          ),
        )
      }
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined

    const [rows, countResult] = await Promise.all([
      db
        .select()
        .from(books)
        .where(where)
        .orderBy(desc(books.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(books)
        .where(where),
    ])

    return {
      data: rows,
      current_page: page,
      per_page: limit,
      total: Number(countResult[0].count),
    }
  })

export const getBook = createServerFn({ method: "GET" })
  .middleware([tracingMiddleware])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    const [book] = await db.select().from(books).where(eq(books.id, data.id))
    return book ?? null
  })

export const createBook = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator((input: BookInput) => input)
  .handler(async ({ data, context }) => {
    if (!hasGroupAccess(context.user, "biblioteksutvalget")) {
      throw new Error("Forbidden")
    }

    // Validate pubdate format if provided
    if (
      data.pubdate &&
      !/^(\d{4}-\d\d(-\d\d)?|\d{4}\??|\d{2}\?)$/.test(data.pubdate)
    ) {
      throw new Error("Invalid pubdate format")
    }

    const { isbnData, thumbnail } = await fetchGoogleBooksData(data.isbn)

    const id = generateId()
    const [book] = await db
      .insert(books)
      .values({
        id,
        title: data.title,
        subtitle: data.subtitle ?? null,
        authors: data.authors ?? null,
        pubdate: data.pubdate ?? null,
        description: data.description ?? null,
        isbn: data.isbn ?? null,
        isbnData,
        thumbnail,
        bibComment: data.bib_comment ?? null,
        bibRoom: data.bib_room ?? null,
        bibSection: data.bib_section ?? null,
      })
      .returning()

    return book
  })

export const updateBook = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator((input: { id: string } & BookInput) => input)
  .handler(async ({ data, context }) => {
    if (!hasGroupAccess(context.user, "biblioteksutvalget")) {
      throw new Error("Forbidden")
    }

    if (
      data.pubdate &&
      !/^(\d{4}-\d\d(-\d\d)?|\d{4}\??|\d{2}\?)$/.test(data.pubdate)
    ) {
      throw new Error("Invalid pubdate format")
    }

    // Re-lookup ISBN data if ISBN changed
    const [existing] = await db
      .select({ isbn: books.isbn })
      .from(books)
      .where(eq(books.id, data.id))
    if (!existing) throw new Error("Not found")

    const updates: Record<string, any> = {
      title: data.title,
      subtitle: data.subtitle ?? null,
      authors: data.authors ?? null,
      pubdate: data.pubdate ?? null,
      description: data.description ?? null,
      isbn: data.isbn ?? null,
      bibComment: data.bib_comment ?? null,
      bibRoom: data.bib_room ?? null,
      bibSection: data.bib_section ?? null,
      updatedAt: new Date(),
    }

    if (data.isbn && data.isbn !== existing.isbn) {
      const lookup = await fetchGoogleBooksData(data.isbn)
      updates.isbnData = lookup.isbnData
      updates.thumbnail = lookup.thumbnail
    } else if (!data.isbn && existing.isbn) {
      updates.isbnData = null
      updates.thumbnail = null
    }

    const [book] = await db
      .update(books)
      .set(updates)
      .where(eq(books.id, data.id))
      .returning()

    if (!book) throw new Error("Not found")
    return book
  })

export const deleteBook = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    if (!hasGroupAccess(context.user, "biblioteksutvalget")) {
      throw new Error("Forbidden")
    }

    const result = await db
      .delete(books)
      .where(eq(books.id, data.id))
      .returning({ id: books.id })

    if (result.length === 0) throw new Error("Not found")
    return { deleted: true }
  })

export const setBookBarcode = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator((input: { id: string; barcode: string }) => input)
  .handler(async ({ data, context }) => {
    if (!hasGroupAccess(context.user, "biblioteksutvalget")) {
      throw new Error("Forbidden")
    }

    const [book] = await db.select().from(books).where(eq(books.id, data.id))

    if (!book) throw new Error("Not found")

    if (book.bibBarcode) {
      throw new Error("Boka har allerede en strekkode tilegnet.")
    }

    if (!data.barcode) {
      throw new Error("Mangler strekkode.")
    }

    // Validate barcode format: BS-XXXX-XX (hex)
    const match = /(BS-[0-9A-F]+-)[0-9A-F]+/.exec(data.barcode)
    if (!match) {
      throw new Error("Formatet på strekkoden er galt.")
    }

    // Check uniqueness of sequence number
    const existing = await db
      .select({ id: books.id })
      .from(books)
      .where(ilike(books.bibBarcode, `${match[1]}%`))
      .limit(1)

    if (existing.length > 0) {
      throw new Error("Løpenummeret er allerede i bruk.")
    }

    await db
      .update(books)
      .set({ bibBarcode: data.barcode, updatedAt: new Date() })
      .where(eq(books.id, data.id))

    return { barcode: data.barcode }
  })

export const lookupIsbn = createServerFn({ method: "GET" })
  .middleware([tracingMiddleware])
  .inputValidator((input: { isbn: string }) => input)
  .handler(async ({ data }) => {
    if (!data.isbn || !env.googleApiKey) {
      return { isbn: data.isbn, found: false, data: {} }
    }

    const volumeInfo = await fetchGoogleBooksVolumeInfo(data.isbn)
    if (!volumeInfo) {
      return { isbn: data.isbn, found: false, data: {} }
    }

    return {
      isbn: data.isbn,
      found: true,
      data: {
        title: volumeInfo.title,
        subtitle: volumeInfo.subtitle ?? null,
        authors: volumeInfo.authors ?? null,
        categories: volumeInfo.categories ?? null,
        description: volumeInfo.description ?? null,
        pubdate: volumeInfo.publishedDate ?? null,
      },
    }
  })

async function fetchGoogleBooksVolumeInfo(isbn: string): Promise<any> {
  if (!env.googleApiKey) return null
  try {
    const res = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=isbn:${encodeURIComponent(isbn)}&key=${env.googleApiKey}`,
    )
    const json = await res.json()
    if (json.totalItems > 0) return json.items[0].volumeInfo
  } catch {
    // best-effort
  }
  return null
}

async function fetchGoogleBooksData(isbn: string | null | undefined) {
  if (!isbn) return { isbnData: null, thumbnail: null }
  const volumeInfo = await fetchGoogleBooksVolumeInfo(isbn)
  return {
    isbnData: volumeInfo,
    thumbnail: (volumeInfo?.imageLinks?.smallThumbnail as string) ?? null,
  }
}
