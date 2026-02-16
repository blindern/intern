import Iron from "@hapi/iron"
import { env } from "./env.js"

const COOKIE_NAME = "intern_session"
const MAX_AGE = 30 * 24 * 60 * 60 // 30 days in seconds

export interface SessionData {
  username?: string
}

/**
 * Read and decrypt session from request cookies.
 */
export async function readSession(request: Request): Promise<SessionData> {
  const cookieHeader = request.headers.get("cookie") ?? ""
  const sealed = parseCookie(cookieHeader, COOKIE_NAME)
  if (!sealed) return {}

  try {
    return (await Iron.unseal(
      sealed,
      env.sessionSecret,
      Iron.defaults,
    )) as SessionData
  } catch {
    return {}
  }
}

/**
 * Create a Set-Cookie header value for the given session data.
 */
export async function createSessionCookie(data: SessionData): Promise<string> {
  const sealed = await Iron.seal(data, env.sessionSecret, Iron.defaults)
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : ""
  return `${COOKIE_NAME}=${sealed}; HttpOnly${secure}; SameSite=Lax; Path=/intern; Max-Age=${MAX_AGE}`
}

/**
 * Create a Set-Cookie header that clears the session.
 */
export function clearSessionCookie(): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : ""
  return `${COOKIE_NAME}=; HttpOnly${secure}; SameSite=Lax; Path=/intern; Max-Age=0`
}

function parseCookie(header: string, name: string): string | undefined {
  const match = new RegExp(`(?:^|;\\s*)${name}=([^;]*)`).exec(header)
  return match?.[1]
}
