import { useLayoutEffect } from "react"

const AUTH_ERROR_MESSAGE = "Denne siden krever at du logger inn."

function isAuthError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message === AUTH_ERROR_MESSAGE
  }
  return false
}

function getLoginUrl() {
  const returnTo = encodeURIComponent(window.location.pathname)
  return `/intern/api/saml2/login?returnTo=${returnTo}`
}

export function ErrorMessages({ error }: { error: unknown }) {
  const message = error instanceof Error ? error.message : String(error)
  const authError = isAuthError(error)

  useLayoutEffect(() => {
    if (authError) {
      window.location.assign(getLoginUrl())
    }
  }, [authError])

  if (authError) {
    return (
      <p>
        {AUTH_ERROR_MESSAGE} <a href={getLoginUrl()}>Logg inn</a>
      </p>
    )
  }

  return <p style={{ color: "red" }}>{message || "Ukjent feil"}</p>
}
