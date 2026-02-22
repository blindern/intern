import { createFileRoute } from "@tanstack/react-router"
import { getSaml } from "../../../server/saml2.js"

export const Route = createFileRoute("/api/saml2/metadata")({
  server: {
    handlers: {
      GET: () => {
        const saml = getSaml()
        const metadata = saml.generateServiceProviderMetadata(null, null)
        return new Response(metadata, {
          headers: { "Content-Type": "text/xml" },
        })
      },
    },
  },
})
