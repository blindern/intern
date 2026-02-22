import { createFileRoute } from "@tanstack/react-router"
import type { Profile } from "@node-saml/node-saml"
import { getSaml } from "../../../server/saml2.js"
import {
  readSession,
  clearSessionCookie,
  safeReturnTo,
} from "../../../server/session.js"

export const Route = createFileRoute("/api/saml2/logout")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const saml = getSaml()
        const session = await readSession(request)

        const returnTo = safeReturnTo(
          new URL(request.url).searchParams.get("returnTo"),
        )

        // Try SAML SLO if we have a session
        try {
          if (session.username) {
            const profile: Profile = {
              issuer: "",
              nameID: session.username,
              nameIDFormat:
                "urn:oasis:names:tc:SAML:2.0:nameid-format:transient",
            }
            const logoutUrl = await saml.getLogoutUrlAsync(
              profile,
              returnTo,
              {},
            )
            const cookie = clearSessionCookie()
            return new Response(null, {
              status: 302,
              headers: {
                Location: logoutUrl,
                "Set-Cookie": cookie,
              },
            })
          }
        } catch {
          // Fall through to simple logout
        }

        // Simple logout: clear cookie and redirect
        const cookie = clearSessionCookie()
        return new Response(null, {
          status: 302,
          headers: {
            Location: returnTo,
            "Set-Cookie": cookie,
          },
        })
      },
    },
  },
})
