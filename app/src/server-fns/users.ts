import { createServerFn } from "@tanstack/react-start"
import { authMiddleware, isGroupOwner, isUserAdmin } from "../server/auth.js"
import { usersApi } from "../server/users-api.js"

export const getUsers = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => {
    return usersApi.getUsers()
  })

export const getUser = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator((input: { username: string }) => input)
  .handler(async ({ data }) => {
    const user = await usersApi.getUser(data.username)
    if (!user) throw new Error("Not found")
    return user
  })

export const getGroups = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => {
    return usersApi.getGroups()
  })

export const getGroup = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator((input: { name: string }) => input)
  .handler(async ({ data }) => {
    const group = await usersApi.getGroup(data.name)
    if (!group) throw new Error("Not found")
    return group
  })

export const addGroupMember = createServerFn({
  method: "POST",
})
  .middleware([authMiddleware])
  .inputValidator(
    (input: { groupName: string; memberType: string; memberId: string }) =>
      input,
  )
  .handler(async ({ data, context }) => {
    const canManage =
      isUserAdmin(context.user) || isGroupOwner(context.user, data.groupName)

    if (!canManage) {
      throw new Error("Forbidden")
    }

    if (!["users", "groups"].includes(data.memberType)) {
      throw new Error("Invalid member type")
    }

    await usersApi.addGroupMember(
      data.groupName,
      data.memberType,
      data.memberId,
    )

    return { success: true }
  })

export const removeGroupMember = createServerFn({
  method: "POST",
})
  .middleware([authMiddleware])
  .inputValidator(
    (input: { groupName: string; memberType: string; memberId: string }) =>
      input,
  )
  .handler(async ({ data, context }) => {
    const canManage =
      isUserAdmin(context.user) || isGroupOwner(context.user, data.groupName)

    if (!canManage) {
      throw new Error("Forbidden")
    }

    if (!["users", "groups"].includes(data.memberType)) {
      throw new Error("Invalid member type")
    }

    await usersApi.removeGroupMember(
      data.groupName,
      data.memberType,
      data.memberId,
    )

    return { success: true }
  })

export const addGroupOwner = createServerFn({
  method: "POST",
})
  .middleware([authMiddleware])
  .inputValidator(
    (input: { groupName: string; ownerType: string; ownerId: string }) => input,
  )
  .handler(async ({ data, context }) => {
    const canManage =
      isUserAdmin(context.user) || isGroupOwner(context.user, data.groupName)

    if (!canManage) {
      throw new Error("Forbidden")
    }

    if (!["users", "groups"].includes(data.ownerType)) {
      throw new Error("Invalid owner type")
    }

    await usersApi.addGroupOwner(data.groupName, data.ownerType, data.ownerId)

    return { success: true }
  })

export const removeGroupOwner = createServerFn({
  method: "POST",
})
  .middleware([authMiddleware])
  .inputValidator(
    (input: { groupName: string; ownerType: string; ownerId: string }) => input,
  )
  .handler(async ({ data, context }) => {
    const canManage =
      isUserAdmin(context.user) || isGroupOwner(context.user, data.groupName)

    if (!canManage) {
      throw new Error("Forbidden")
    }

    if (!["users", "groups"].includes(data.ownerType)) {
      throw new Error("Invalid owner type")
    }

    await usersApi.removeGroupOwner(
      data.groupName,
      data.ownerType,
      data.ownerId,
    )

    return { success: true }
  })
