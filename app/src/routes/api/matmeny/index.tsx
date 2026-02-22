import { createFileRoute } from "@tanstack/react-router"
import { db } from "../../../server/db.js"
import { matmeny } from "../../../server/schema.js"
import { between } from "drizzle-orm"
import { defaultDateRange } from "../../../features/matmeny/server-fns.js"

export const Route = createFileRoute("/api/matmeny/")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const fromParam = url.searchParams.get("from")
        const toParam = url.searchParams.get("to")

        const range = defaultDateRange()
        const from = fromParam ?? range.from
        const to = toParam ?? range.to

        const days = await db
          .select()
          .from(matmeny)
          .where(between(matmeny.day, from, to))
          .orderBy(matmeny.day)

        return Response.json(days)
      },
    },
  },
})
