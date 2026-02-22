import { createServerFn } from "@tanstack/react-start"
import { authMiddleware } from "../../server/auth.js"

interface DugnadPerson {
  name: string
  room: string
}

export interface DugnadDay {
  id: string
  date: string
  people: DugnadPerson[]
}

export const getDugnadenOld = createServerFn({
  method: "GET",
})
  .middleware([authMiddleware])
  .handler(async (): Promise<DugnadDay[]> => {
    try {
      const res = await fetch(
        "http://dugnaden.zt.foreningenbs.no/dugnaden/api.php?method=list",
      )
      return (await res.json()) as DugnadDay[]
    } catch {
      return []
    }
  })
