import { createFileRoute } from "@tanstack/react-router"
import { db } from "../../server/db.js"
import { matmeny } from "../../server/schema.js"
import { between } from "drizzle-orm"

export const Route = createFileRoute("/api/matmeny/ics")({
  server: {
    handlers: {
      GET: async () => {
        const now = new Date()
        const from = new Date(now)
        from.setDate(from.getDate() - 52 * 7)
        const to = new Date(now)
        to.setDate(to.getDate() + 5 * 7)

        const fromStr = formatDate(from)
        const toStr = formatDate(to)

        const days = await db
          .select()
          .from(matmeny)
          .where(between(matmeny.day, fromStr, toStr))
          .orderBy(matmeny.day)

        const events = days
          .map((day) => {
            let text = ""
            if (day.dishes) {
              text = day.dishes.join(", ")
            }
            if (day.text) {
              if (text) text += " "
              text += `(${day.text})`
            }

            const dateStr = day.day.replace(/-/g, "")

            return [
              "BEGIN:VEVENT",
              `UID:matmeny-${day.day}`,
              `DTSTART;VALUE=DATE:${dateStr}`,
              `SUMMARY:${escapeIcal(text)}`,
              "END:VEVENT",
            ].join("\r\n")
          })
          .join("\r\n")

        const calendar = [
          "BEGIN:VCALENDAR",
          "VERSION:2.0",
          "PRODID:-//foreningenbs.no//matmeny//NO",
          "X-WR-CALNAME:foreningenbs.no/matmeny",
          "X-WR-CALDESC:Matmeny Blindern Studenterhjem",
          events,
          "END:VCALENDAR",
        ].join("\r\n")

        return new Response(calendar, {
          headers: {
            "Content-Type": "text/calendar; charset=utf-8",
            "Content-Disposition": 'inline; filename="matmeny.ics"',
          },
        })
      },
    },
  },
})

function formatDate(d: Date): string {
  return d.toISOString().split("T")[0]
}

function escapeIcal(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n")
}
