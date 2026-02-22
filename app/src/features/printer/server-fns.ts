import { createServerFn } from "@tanstack/react-start"
import { authMiddleware } from "../../server/auth.js"
import {
  getLastPrints,
  getUsageData,
  getDailyUsageData,
  printerConfig,
} from "./printer-db.js"
import { usersApi } from "../../server/users-api.js"

export const getPrinterLast = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => {
    const last = await getLastPrints(30)

    // Fetch all users for realname lookup
    const users = await usersApi.getUsers()
    const names: Record<string, string> = {}
    for (const user of users) {
      names[user.username] = user.realname ?? user.username
    }

    return last.map((row) => ({
      ...row,
      realname: names[row.username] ?? row.username,
    }))
  })

export const getPrinterUsage = createServerFn({
  method: "GET",
})
  .middleware([authMiddleware])
  .inputValidator((input: { from: string; to: string }) => {
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(input.from) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(input.to)
    ) {
      throw new Error("Invalid date format")
    }
    return input
  })
  .handler(async ({ data }) => {
    const [prints, daily] = await Promise.all([
      getUsageData(data.from, data.to),
      getDailyUsageData(data.from, data.to),
    ])

    // Fetch all users for realnames and beboer group
    const [users, beboerGroup] = await Promise.all([
      usersApi.getUsers(),
      usersApi.getGroup("beboer"),
    ])

    const realnames: Record<string, string> = {}
    for (const user of users) {
      realnames[user.username.toLowerCase()] = user.realname ?? user.username
    }

    const beboere = new Set(
      beboerGroup?.members?.map((u) => u.username.toLowerCase()) ?? [],
    )

    const utflyttet = users
      .filter((u) => !beboere.has(u.username.toLowerCase()))
      .map((u) => u.username.toLowerCase())

    return {
      prints,
      texts: printerConfig.texts,
      no_faktura: printerConfig.no_faktura,
      from: data.from,
      to: data.to,
      daily,
      sections: printerConfig.sections,
      section_default: printerConfig.section_default,
      accounts: printerConfig.accounts,
      realnames,
      utflyttet,
    }
  })
