import { createFileRoute } from "@tanstack/react-router"
import { db } from "../../../server/db.js"
import { matmeny } from "../../../server/schema.js"
import { between } from "drizzle-orm"

const dayNames = [
  "Mandag",
  "Tirsdag",
  "Onsdag",
  "Torsdag",
  "Fredag",
  "Lørdag",
  "Søndag",
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
        const today = formatDate(now)

        const data: { date: string; day: (typeof days)[0] | undefined }[][] =
          Array.from({ length: 7 }, () => [])
        const current = new Date(from)
        for (let week = 0; week < 3; week++) {
          for (let d = 0; d < 7; d++) {
            const dateStr = formatDate(current)
            data[d].push({ date: dateStr, day: dayMap.get(dateStr) })
            current.setDate(current.getDate() + 1)
          }
        }

        let rows = ""
        for (let d = 0; d < 7; d++) {
          rows += `<tr><th>${esc(dayNames[d])}</th>`
          for (const cell of data[d]) {
            let style = ""
            if (cell.date === today) style += "background-color:#00FF00;"

            const parts: string[] = []
            if (cell.day?.text) {
              parts.push(
                `<span style="color:red">${esc(cell.day.text)}</span>`,
              )
            }
            if (cell.day?.dishes) {
              for (const dish of cell.day.dishes) {
                parts.push(esc(dish))
              }
            }

            if (parts.length === 0) {
              style += "font-style:italic;color:#CCC"
              parts.push("Ingen data")
            }

            rows += `<td style="${style}">${parts.join("<br>")}</td>`
          }
          rows += "</tr>\n"
        }

        const html = `<!DOCTYPE html>
<html>
<head>
<meta name="robots" content="noindex, nofollow" />
<title>Matmeny</title>
<style>
.table {
    border: 1px solid black;
    border-collapse: collapse;
    margin-bottom: 1em;
}
.table th {
    text-align: left;
    background-color: #EEEEEE;
}
.table td, .table th {
    border: 1px solid black;
    padding: 2px 4px;
}
</style>
</head>
<body>
<table class="table matmeny">
    <thead>
        <tr>
            <th>&nbsp;</th>
            <th>Forrige uke</th>
            <th>Denne uke</th>
            <th>Neste uke</th>
        </tr>
    </thead>
    <tbody>
${rows}
    </tbody>
</table>
<p><span style="background-color: #00FF00">Grønt</span> er dagens. Kjøkkensjefen oppdaterer selv denne menyen på nett.</p>
</body>
</html>`

        return new Response(html, {
          headers: { "Content-Type": "text/html; charset=utf-8" },
        })
      },
    },
  },
})

function formatDate(d: Date): string {
  return d.toISOString().split("T")[0]
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}
