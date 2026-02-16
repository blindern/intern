import { createFileRoute } from "@tanstack/react-router"
import { getSaml } from "../../../server/saml2.js"
import { clearSessionCookie } from "../../../server/session.js"

export const Route = createFileRoute("/api/saml2/sls")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const samlResponse = url.searchParams.get("SAMLResponse")
        const samlRequest = url.searchParams.get("SAMLRequest")

        if (!samlResponse && !samlRequest) {
          return new Response(null, {
            status: 302,
            headers: { Location: "/intern/" },
          })
        }

        const saml = getSaml()

        const query: Record<string, string> = {}
        for (const [key, value] of url.searchParams.entries()) {
          query[key] = value
        }

        await saml.validateRedirectAsync(query, url.search)

        const cookie = clearSessionCookie()
        const returnTo = url.searchParams.get("RelayState") ?? "/intern/"

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
