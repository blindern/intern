import { serve } from "@hono/node-server"
import { serveStatic } from "@hono/node-server/serve-static"
import { Hono } from "hono"
import handler from "./dist/server/server.js"

const app = new Hono()

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
