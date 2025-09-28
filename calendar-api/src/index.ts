import { cors } from "@elysiajs/cors"
import { node } from "@elysiajs/node"
import { Elysia } from "elysia"
import { z } from "zod"
import { createIcs } from "./create-ics.ts"
import { getAllEvents, getNextEvents } from "./event-mapper.ts"
import { EventService } from "./event-service.ts"

process.on("SIGINT", () => {
  console.log("Received SIGINT - exiting")
  process.exit()
})

const eventService = new EventService()
eventService.preload()

new Elysia({ adapter: node() })
  .use(cors())
  .onBeforeHandle(({ path }) => {
    console.log(`Handling request at ${path}`)
  })
  .onError(({ error, code, set }) => {
    if (code === "UNKNOWN") {
      console.log("Error", error)
      set.status = 500
      return "Failed"
    }
    return
  })
  .get("/", () => "https://github.com/blindern/intern")
  .get("/health", () => "I am alive!")
  .get(
    "/events.ics",
    async () =>
      new Response(createIcs(await eventService.getEvents({ fresh: false })), {
        headers: {
          "content-disposition": "inline; filename=cal.ics",
          "content-type": "text/calendar; charset=utf-8",
        },
      }),
  )
  .get(
    "/events",
    async ({ query }) =>
      getAllEvents(
        await eventService.getEvents({ fresh: query.fresh != null }),
      ),
    {
      query: z.object({
        fresh: z.string().optional(),
      }),
    },
  )
  .get(
    "/events/next",
    async ({ query }) =>
      getNextEvents(
        await eventService.getEvents({
          fresh: query.fresh != null,
        }),
        query.count,
      ),
    {
      query: z.object({
        count: z.coerce.number().min(1).max(100).default(5),
        fresh: z.string().optional(),
      }),
    },
  )
  .post("/invalidate", () => {
    eventService.invalidateCache()
    return { invalidated: true }
  })
  .listen(8000)

console.log("App running")
