import { createServerFn } from "@tanstack/react-start"
import { authMiddleware } from "../../server/auth.js"

export const getDugnadenOld = createServerFn({
  method: "GET",
})
  .middleware([authMiddleware])
  .handler(async () => {
    try {
      const res = await fetch(
        "http://dugnaden.zt.foreningenbs.no/dugnaden/api.php?method=list",
      )
      return res.json()
    } catch {
      return []
    }
  })
