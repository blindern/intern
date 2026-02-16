import { createFileRoute } from "@tanstack/react-router"
import { getSaml } from "../../../server/saml2.js"
import { createSessionCookie } from "../../../server/session.js"

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
          const usernameAttr = (profile as any).attributes?.username
          const username =
            (Array.isArray(usernameAttr) ? usernameAttr[0] : usernameAttr) ??
            (profile as any).username ??
            profile.nameID

          if (!username) {
            throw new Error("No username in SAML assertion")
          }

          const cookie = await createSessionCookie({ username })
          const returnTo = body.RelayState || "/intern/"

          return new Response(null, {
            status: 302,
            headers: {
              Location: returnTo,
              "Set-Cookie": cookie,
            },
          })
        } catch (err) {
          console.error("SAML ACS error:", err)
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
