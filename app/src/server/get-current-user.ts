import { getRequest } from "@tanstack/react-start/server"
import { readSession } from "./session.js"
import { usersApi, type UsersApiUser } from "./users-api.js"

/**
 * Read the current user from the session cookie.
 * Returns null if not authenticated.
 *
 * This is in a separate file from auth.ts because it imports
 * @tanstack/react-start/server which pulls in react-dom/server.
 * auth.ts exports authMiddleware which is needed on the client
 * (for middleware chaining), so it must not have server-only imports.
 */
export async function getCurrentUser(): Promise<UsersApiUser | null> {
  const request = getRequest()
  const session = await readSession(request)
  if (!session.username) return null
  return usersApi.getUser(session.username)
}
