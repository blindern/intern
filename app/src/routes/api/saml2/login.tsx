import { createFileRoute } from "@tanstack/react-router"
import { getSaml } from "../../../server/saml2.js"

export const Route = createFileRoute("/api/saml2/login")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const returnTo = url.searchParams.get("returnTo") ?? "/intern/"
        const saml = getSaml()
        const loginUrl = await saml.getAuthorizeUrlAsync(returnTo, url.host, {})
        return new Response(null, {
          status: 302,
          headers: { Location: loginUrl },
        })
      },
    },
  },
})
