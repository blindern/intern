import { createServerFn } from "@tanstack/react-start"
import { getCurrentUser } from "../server/get-current-user.js"
import { isUserAdmin } from "../server/auth.js"
import { tracingMiddleware } from "../server/tracing.js"

export const getMe = createServerFn({ method: "GET" })
  .middleware([tracingMiddleware])
  .handler(async () => {
    const user = await getCurrentUser()
    if (!user) {
      return { isLoggedIn: false as const, isUserAdmin: false }
    }
    return {
      isLoggedIn: true as const,
      user,
      isUserAdmin: isUserAdmin(user),
    }
  })
