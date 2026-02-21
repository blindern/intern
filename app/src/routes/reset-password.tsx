import { createFileRoute, useSearch } from "@tanstack/react-router"
import { PageTitle } from "../hooks/useTitle.js"
import {
  useResetPasswordMutation,
  useValidateTokenQuery,
} from "../features/password-reset/hooks.js"
import { useState } from "react"

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordPage,
  validateSearch: (search: Record<string, unknown>) => ({
    token: (search.token as string) ?? "",
  }),
})

function ResetPasswordPage() {
  const { token } = useSearch({ from: "/reset-password" })
  const [password, setPassword] = useState("")
  const [isDone, setIsDone] = useState(false)
  const { isPending, mutateAsync } = useResetPasswordMutation()
  const tokenQuery = useValidateTokenQuery(token || null)

  if (!token) {
    return (
      <>
        <PageTitle title="Tilbakestill passord" />
        <div className="row">
          <div className="col-md-6">
            <p className="text-danger">Ugyldig lenke. Mangler token.</p>
          </div>
        </div>
      </>
    )
  }

  if (tokenQuery.isLoading) {
    return (
      <>
        <PageTitle title="Tilbakestill passord" />
        <div className="row">
          <div className="col-md-6">
            <p>Validerer lenke...</p>
          </div>
        </div>
      </>
    )
  }

  if (tokenQuery.isError) {
    return (
      <>
        <PageTitle title="Tilbakestill passord" />
        <div className="row">
          <div className="col-md-6">
            <p className="text-danger">
              Denne lenken er ugyldig eller utløpt. Vennligst be om en ny.
            </p>
          </div>
        </div>
      </>
    )
  }

  if (isDone) {
    return (
      <>
        <PageTitle title="Tilbakestill passord" />
        <div className="row">
          <div className="col-md-6">
            <p>Passordet er oppdatert. Du kan nå logge inn.</p>
          </div>
        </div>
      </>
    )
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      await mutateAsync({ token, password })
      setIsDone(true)
    } catch {
      /* flash shown automatically */
    }
  }

  return (
    <>
      <PageTitle title="Tilbakestill passord" />
      <div className="row">
        <div className="col-md-6">
          <p>Velg et nytt passord for din foreningsbruker.</p>
          <form onSubmit={onSubmit} className="form-horizontal" role="form">
            <div className="form-group">
              <label htmlFor="new_password" className="col-lg-4 control-label">
                Nytt passord
              </label>
              <div className="col-lg-8">
                <input
                  type="password"
                  className="form-control"
                  id="new_password"
                  placeholder="Nytt passord"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  required
                  autoFocus
                />
                <span className="help-block">Minst 8 tegn.</span>
              </div>
            </div>
            <div className="form-group">
              <div className="col-lg-offset-4 col-lg-8">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isPending || password.length < 8}
                >
                  {isPending ? "Oppdaterer..." : "Oppdater passord"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
