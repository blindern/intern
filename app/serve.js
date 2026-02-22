import { serve } from "@hono/node-server"
import { serveStatic } from "@hono/node-server/serve-static"
import { Hono } from "hono"
import handler from "./dist/server/server.js"

const calendarApiUrl = process.env.CALENDAR_API_URL ?? "http://localhost:8000"

const app = new Hono()

// Calendar API proxies (URLs with dots can't be TanStack Router routes)
app.get("/intern/arrplan.ics", async (c) => {
  const res = await fetch(`${calendarApiUrl}/arrplan.ics${new URL(c.req.url).search}`)
  return new Response(res.body, {
    status: res.status,
    headers: { "Content-Type": res.headers.get("Content-Type") ?? "text/calendar; charset=utf-8" },
  })
})

app.get("/intern/kalender.ical", async (c) => {
  const res = await fetch(`${calendarApiUrl}/kalender.ical${new URL(c.req.url).search}`)
  return new Response(res.body, {
    status: res.status,
    headers: { "Content-Type": res.headers.get("Content-Type") ?? "text/calendar; charset=utf-8" },
  })
})

// Rewrite dotted URL to dash route handled by TanStack Start
app.get("/intern/api/matmeny.ics", async (c) => {
  const url = new URL(c.req.url)
  url.pathname = "/intern/api/matmeny-ics"
  const res = await handler.fetch(new Request(url, c.req.raw))
  return new Response(res.body, { status: res.status, headers: res.headers })
})

app.use(
  "/intern/*",
  serveStatic({
    root: "./dist/client",
    rewriteRequestPath: (path) => path.replace(/^\/intern/, ""),
  }),
)

app.all("*", async (c) => {
  const res = await handler.fetch(c.req.raw)
  return new Response(res.body, {
    status: res.status,
    headers: res.headers,
  })
})

const port = Number(process.env.PORT) || 3000
console.log(`Listening on port ${port}`)
serve({ fetch: app.fetch, port })
