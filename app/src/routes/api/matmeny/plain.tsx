import { createFileRoute } from "@tanstack/react-router"
import { db } from "../../../server/db.js"
import { matmeny } from "../../../server/schema.js"
import { between } from "drizzle-orm"

const dayNames = [
  "Søndag",
  "Mandag",
  "Tirsdag",
  "Onsdag",
  "Torsdag",
  "Fredag",
  "Lørdag",
]

export const Route = createFileRoute("/api/matmeny/plain")({
  server: {
    handlers: {
      GET: async () => {
        const now = new Date()
        const day = now.getDay()
        const diff = now.getDate() - day + (day === 0 ? -6 : 1)

        const monday = new Date(now)
        monday.setDate(diff)

        const from = new Date(monday)
        from.setDate(from.getDate() - 7)

        const to = new Date(monday)
        to.setDate(to.getDate() + 13)

        const fromStr = formatDate(from)
        const toStr = formatDate(to)

        const days = await db
          .select()
          .from(matmeny)
          .where(between(matmeny.day, fromStr, toStr))
          .orderBy(matmeny.day)

        const dayMap = new Map(days.map((d) => [d.day, d]))

        // Build 3-week table as plain text
        const lines: string[] = []
        const current = new Date(from)

        for (let week = 0; week < 3; week++) {
          for (let d = 0; d < 7; d++) {
            const dateStr = formatDate(current)
            const dayData = dayMap.get(dateStr)
            const dayName = dayNames[current.getDay()]

            let content = ""
            if (dayData) {
              if (dayData.dishes) {
                content = dayData.dishes.join(", ")
              }
              if (dayData.text) {
                if (content) content += " "
                content += `(${dayData.text})`
              }
            }

            lines.push(`${dayName} ${dateStr}: ${content || "-"}`)
            current.setDate(current.getDate() + 1)
          }
          lines.push("")
        }

        return new Response(lines.join("\n"), {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
          },
        })
      },
    },
  },
})

function formatDate(d: Date): string {
  return d.toISOString().split("T")[0]
}
