import { createFileRoute } from "@tanstack/react-router"
import { logger } from "../../../server/logger.js"
import { getSaml } from "../../../server/saml2.js"
import { createSessionCookie, safeReturnTo } from "../../../server/session.js"

export const Route = createFileRoute("/api/saml2/acs")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const saml = getSaml()

          const formData = await request.formData()
          const body: Record<string, string> = {}
          for (const [key, value] of formData.entries()) {
            body[key] = value as string
          }

          const { profile } = await saml.validatePostResponseAsync(body)

          if (!profile) {
            throw new Error("SAML assertion validation failed")
          }

          // Extract username from SAML attributes
          const attributes = profile.attributes as
            | Record<string, unknown>
            | undefined
          const usernameAttr = attributes?.username
          const username = String(
            (Array.isArray(usernameAttr) ? usernameAttr[0] : usernameAttr) ??
              profile.username ??
              profile.nameID,
          )

          if (!username) {
            throw new Error("No username in SAML assertion")
          }

          const cookie = await createSessionCookie({ username })
          const returnTo = safeReturnTo(body.RelayState)

          return new Response(null, {
            status: 302,
            headers: {
              Location: returnTo,
              "Set-Cookie": cookie,
            },
          })
        } catch (err) {
          logger.error({ err }, "SAML ACS error")
          const message = err instanceof Error ? err.message : "Unknown error"
          return new Response(`SAML login failed: ${message}`, {
            status: 500,
            headers: { "Content-Type": "text/plain" },
          })
        }
      },
    },
  },
})
