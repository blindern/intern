import { createFileRoute } from "@tanstack/react-router"
import { and, inArray, isNull } from "drizzle-orm"
import { db } from "../../../server/db.js"
import { env } from "../../../server/env.js"
import {
  googleappsAccounts,
  googleappsAccountusers,
} from "../../../server/schema.js"
import { readSession } from "../../../server/session.js"
import { usersApi } from "../../../server/users-api.js"

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  })
}

export const Route = createFileRoute("/api/googleapps/accounts")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        // Auth: Bearer token (for SimpleSAMLphp) or session cookie
        const token = env.accountsUrlAuthToken
        const authHeader = request.headers.get("Authorization")

        let authenticated = false
        if (token && authHeader === `Bearer ${token}`) {
          authenticated = true
        } else {
          const session = await readSession(request)
          if (session.username) {
            authenticated = true
          }
        }

        if (!authenticated) {
          return json({ error: "Unauthorized" }, 401)
        }

        const url = new URL(request.url)
        const expand = url.searchParams.has("expand")

        const accounts = await db
          .select()
          .from(googleappsAccounts)
          .where(isNull(googleappsAccounts.deletedAt))
          .orderBy(googleappsAccounts.accountname)

        const accountIds = accounts.map((a) => a.id)
        const allAccountUsers =
          accountIds.length > 0
            ? await db
                .select()
                .from(googleappsAccountusers)
                .where(
                  and(
                    inArray(googleappsAccountusers.accountId, accountIds),
                    isNull(googleappsAccountusers.deletedAt),
                  ),
                )
            : []

        const usersByAccount = new Map<
          string,
          (typeof allAccountUsers)[number][]
        >()
        for (const u of allAccountUsers) {
          const list = usersByAccount.get(u.accountId) ?? []
          list.push(u)
          usersByAccount.set(u.accountId, list)
        }

        let ldapUserMap:
          | Map<string, { email?: string | null; realname?: string | null }>
          | undefined
        if (expand) {
          const allUsers = await usersApi.getUsers()
          ldapUserMap = new Map(
            allUsers.map((u) => [u.username.toLowerCase(), u]),
          )
        }

        const result = accounts.map((account) => {
          const users = usersByAccount.get(account.id) ?? []
          const enrichedUsers = users.map((u) => {
            const ldapUser = ldapUserMap?.get(u.username.toLowerCase())
            return {
              ...u,
              email: ldapUser?.email ?? null,
              realname: ldapUser?.realname ?? null,
            }
          })
          return { ...account, users: enrichedUsers }
        })

        return json(result)
      },
    },
  },
})
