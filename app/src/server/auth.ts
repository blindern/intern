import { createMiddleware } from "@tanstack/react-start"
import { getCurrentUser } from "./get-current-user.js"
import type { UsersApiUser } from "./users-api.js"
import { tracingMiddleware } from "./tracing.js"

/**
 * Middleware that requires authentication.
 * Chains tracing and adds `user` to the server function context.
 */
export const authMiddleware = createMiddleware()
  .middleware([tracingMiddleware])
  .server(async ({ next }) => {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error("Not authenticated")
    }
    return next({ context: { user } })
  })

/**
 * Check if the user is in a specific group.
 */
export function isInGroup(user: UsersApiUser, groupName: string): boolean {
  return user.groups?.includes(groupName) ?? false
}

/**
 * Check if the user is a superadmin.
 */
export function isSuperAdmin(user: UsersApiUser): boolean {
  return isInGroup(user, "admin")
}

/**
 * Check if the user is a user admin.
 */
export function isUserAdmin(user: UsersApiUser): boolean {
  return isInGroup(user, "useradmin") || isSuperAdmin(user)
}

/**
 * Check if the user is an owner of a group.
 */
export function isGroupOwner(user: UsersApiUser, groupName: string): boolean {
  return (
    user.groupsowner_relation?.[groupName] !== undefined || isSuperAdmin(user)
  )
}
