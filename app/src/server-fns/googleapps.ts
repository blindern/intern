import { createServerFn } from "@tanstack/react-start"
import { and, eq, inArray, isNull } from "drizzle-orm"
import { db } from "../server/db.js"
import { googleappsAccounts, googleappsAccountusers } from "../server/schema.js"
import { generateId } from "../server/id.js"
import { authMiddleware, hasGroupAccess } from "../server/auth.js"
import { usersApi } from "../server/users-api.js"

export const getGoogleAppsAccounts = createServerFn({
  method: "GET",
})
  .middleware([authMiddleware])
  .inputValidator((input: { expand?: boolean }) => input)
  .handler(async ({ data }) => {
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

    const usersByAccount = new Map<string, (typeof allAccountUsers)[number][]>()
    for (const u of allAccountUsers) {
      const list = usersByAccount.get(u.accountId) ?? []
      list.push(u)
      usersByAccount.set(u.accountId, list)
    }

    let ldapUserMap:
      | Map<string, { email?: string | null; realname?: string | null }>
      | undefined
    if (data.expand) {
      const allUsers = await usersApi.getUsers()
      ldapUserMap = new Map(allUsers.map((u) => [u.username.toLowerCase(), u]))
    }

    return accounts.map((account) => {
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
  })

export const getGoogleAppsAccount = createServerFn({
  method: "GET",
})
  .middleware([authMiddleware])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    const [account] = await db
      .select()
      .from(googleappsAccounts)
      .where(
        and(
          eq(googleappsAccounts.id, data.id),
          isNull(googleappsAccounts.deletedAt),
        ),
      )

    if (!account) throw new Error("Not found")

    const users = await db
      .select()
      .from(googleappsAccountusers)
      .where(
        and(
          eq(googleappsAccountusers.accountId, account.id),
          isNull(googleappsAccountusers.deletedAt),
        ),
      )

    return { ...account, users }
  })

export const createGoogleAppsAccount = createServerFn({
  method: "POST",
})
  .middleware([authMiddleware])
  .inputValidator((input: { accountname: string; group: string }) => input)
  .handler(async ({ data, context }) => {
    if (!hasGroupAccess(context.user, "ukestyret")) {
      throw new Error("Forbidden")
    }

    if (!data.accountname || data.accountname.length > 40) {
      throw new Error("Invalid accountname")
    }

    // Check for soft-deleted account to restore
    const [existing] = await db
      .select()
      .from(googleappsAccounts)
      .where(eq(googleappsAccounts.accountname, data.accountname))

    if (existing) {
      if (existing.deletedAt) {
        // Restore
        const [restored] = await db
          .update(googleappsAccounts)
          .set({
            group: data.group,
            deletedAt: null,
            updatedAt: new Date(),
          })
          .where(eq(googleappsAccounts.id, existing.id))
          .returning()
        return restored
      }
      throw new Error("Account already exists")
    }

    const [account] = await db
      .insert(googleappsAccounts)
      .values({
        id: generateId(),
        accountname: data.accountname,
        group: data.group,
      })
      .returning()

    return account
  })

export const updateGoogleAppsAccount = createServerFn({
  method: "POST",
})
  .middleware([authMiddleware])
  .inputValidator(
    (input: {
      id: string
      accountname: string
      group: string
      aliases?: string[] | null
    }) => input,
  )
  .handler(async ({ data, context }) => {
    if (!hasGroupAccess(context.user, "ukestyret")) {
      throw new Error("Forbidden")
    }

    const [account] = await db
      .update(googleappsAccounts)
      .set({
        accountname: data.accountname,
        group: data.group,
        aliases: data.aliases ?? null,
        updatedAt: new Date(),
      })
      .where(eq(googleappsAccounts.id, data.id))
      .returning()

    if (!account) throw new Error("Not found")
    return account
  })

export const deleteGoogleAppsAccount = createServerFn({
  method: "POST",
})
  .middleware([authMiddleware])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    if (!hasGroupAccess(context.user, "ukestyret")) {
      throw new Error("Forbidden")
    }

    const now = new Date()

    // Soft-delete users
    await db
      .update(googleappsAccountusers)
      .set({ deletedAt: now, updatedAt: now })
      .where(eq(googleappsAccountusers.accountId, data.id))

    // Soft-delete account
    await db
      .update(googleappsAccounts)
      .set({ deletedAt: now, updatedAt: now })
      .where(eq(googleappsAccounts.id, data.id))

    return { deleted: true }
  })

// Account Users

export const createGoogleAppsAccountUser = createServerFn({
  method: "POST",
})
  .middleware([authMiddleware])
  .inputValidator(
    (input: {
      accountname: string
      username: string
      notification?: boolean
    }) => input,
  )
  .handler(async ({ data, context }) => {
    if (!hasGroupAccess(context.user, "ukestyret")) {
      throw new Error("Forbidden")
    }

    const [account] = await db
      .select()
      .from(googleappsAccounts)
      .where(
        and(
          eq(googleappsAccounts.accountname, data.accountname),
          isNull(googleappsAccounts.deletedAt),
        ),
      )

    if (!account) throw new Error("Account not found")

    // Verify user exists in LDAP
    const ldapUser = await usersApi.getUser(data.username)
    if (!ldapUser) throw new Error("User not found")

    // Check for soft-deleted entry to restore
    const [existing] = await db
      .select()
      .from(googleappsAccountusers)
      .where(
        and(
          eq(googleappsAccountusers.accountId, account.id),
          eq(googleappsAccountusers.username, ldapUser.username),
        ),
      )

    if (existing) {
      if (existing.deletedAt) {
        const [restored] = await db
          .update(googleappsAccountusers)
          .set({
            notification: data.notification ?? false,
            deletedAt: null,
            updatedAt: new Date(),
          })
          .where(eq(googleappsAccountusers.id, existing.id))
          .returning()
        return restored
      }
      throw new Error("Account user already exists")
    }

    const [accountUser] = await db
      .insert(googleappsAccountusers)
      .values({
        id: generateId(),
        accountId: account.id,
        username: ldapUser.username,
        notification: data.notification ?? false,
      })
      .returning()

    return accountUser
  })

export const updateGoogleAppsAccountUser = createServerFn({
  method: "POST",
})
  .middleware([authMiddleware])
  .inputValidator((input: { id: string; notification: boolean }) => input)
  .handler(async ({ data, context }) => {
    if (!hasGroupAccess(context.user, "ukestyret")) {
      throw new Error("Forbidden")
    }

    const [accountUser] = await db
      .update(googleappsAccountusers)
      .set({
        notification: data.notification,
        updatedAt: new Date(),
      })
      .where(eq(googleappsAccountusers.id, data.id))
      .returning()

    if (!accountUser) throw new Error("Not found")
    return accountUser
  })

export const deleteGoogleAppsAccountUser = createServerFn({
  method: "POST",
})
  .middleware([authMiddleware])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    if (!hasGroupAccess(context.user, "ukestyret")) {
      throw new Error("Forbidden")
    }

    await db
      .update(googleappsAccountusers)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(googleappsAccountusers.id, data.id))

    return { deleted: true }
  })
