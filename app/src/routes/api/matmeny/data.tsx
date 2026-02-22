import { createFileRoute } from "@tanstack/react-router"
import { db } from "../../../server/db.js"
import { matmeny } from "../../../server/schema.js"
import { between } from "drizzle-orm"
import { defaultDateRange } from "../../../features/matmeny/server-fns.js"

const dateRe = /^\d{4}-\d{2}-\d{2}$/

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  })
}

export const Route = createFileRoute("/api/matmeny/data")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const fromParam = url.searchParams.get("from")
        const toParam = url.searchParams.get("to")

        if ((fromParam || toParam) && !(fromParam && toParam)) {
          return json({ error: "Both 'from' and 'to' are required" }, 400)
        }

        if (fromParam && !dateRe.test(fromParam)) {
          return json(
            { error: "Invalid 'from' date format, expected YYYY-MM-DD" },
            400,
          )
        }
        if (toParam && !dateRe.test(toParam)) {
          return json(
            { error: "Invalid 'to' date format, expected YYYY-MM-DD" },
            400,
          )
        }

        const { from, to } =
          fromParam && toParam
            ? { from: fromParam, to: toParam }
            : defaultDateRange()

        const days = await db
          .select({
            day: matmeny.day,
            text: matmeny.text,
            dishes: matmeny.dishes,
          })
          .from(matmeny)
          .where(between(matmeny.day, from, to))
          .orderBy(matmeny.day)

        return json(days)
      },
    },
  },
})
