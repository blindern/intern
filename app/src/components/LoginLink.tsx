import { ReactNode } from "react"

export function LoginLink({ children }: { children: ReactNode }) {
  return <a href="/intern/api/saml2/login?returnTo=/intern/">{children}</a>
}
