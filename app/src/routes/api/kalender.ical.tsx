import { createFileRoute } from "@tanstack/react-router"
import { env } from "../../server/env.js"

export const Route = createFileRoute("/api/kalender/ical")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const targetUrl = `${env.calendarApiUrl}/kalender.ical${url.search}`

        const res = await fetch(targetUrl)
        return new Response(res.body, {
          status: res.status,
          headers: {
            "Content-Type":
              res.headers.get("Content-Type") ?? "text/calendar; charset=utf-8",
          },
        })
      },
    },
  },
})
