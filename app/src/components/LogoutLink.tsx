import { ReactNode, useCallback } from "react"

export function LogoutLink({ children }: { children: ReactNode }) {
  const handleLogout = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    // Submit a form POST to the logout endpoint
    const form = document.createElement("form")
    form.method = "POST"
    form.action = `/intern/api/saml2/logout?returnTo=${encodeURIComponent(window.location.pathname)}`
    document.body.appendChild(form)
    form.submit()
  }, [])

  return (
    <a href="/" onClick={handleLogout}>
      {children}
    </a>
  )
}
