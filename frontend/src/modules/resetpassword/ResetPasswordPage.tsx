import { useTitle } from "modules/core/title/PageTitle.js"
import { useState } from "react"
import { useSearchParams } from "react-router-dom"
import { useResetPasswordMutation, useValidateTokenQuery } from "./api.js"

export const ResetPasswordPage = () => {
  useTitle("Tilbakestill passord")

  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")
  const [password, setPassword] = useState("")
  const [isDone, setIsDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { isPending, mutateAsync: resetPassword } = useResetPasswordMutation()
  const tokenQuery = useValidateTokenQuery(token)

  if (!token) {
    return (
      <div className="row">
        <div className="col-md-6">
          <p className="text-danger">Ugyldig lenke. Mangler token.</p>
        </div>
      </div>
    )
  }

  if (tokenQuery.isLoading) {
    return (
      <div className="row">
        <div className="col-md-6">
          <p>Validerer lenke...</p>
        </div>
      </div>
    )
  }

  if (tokenQuery.isError) {
    return (
      <div className="row">
        <div className="col-md-6">
          <p className="text-danger">
            Denne lenken er ugyldig eller utløpt. Vennligst be om en ny.
          </p>
        </div>
      </div>
    )
  }

  if (isDone) {
    return (
      <div className="row">
        <div className="col-md-6">
          <p>Passordet er oppdatert. Du kan nå logge inn.</p>
        </div>
      </div>
    )
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      await resetPassword({ token: token!, password })
      setIsDone(true)
    } catch {
      setError("Kunne ikke oppdatere passordet. Lenken kan være utløpt.")
    }
  }

  return (
    <div className="row">
      <div className="col-md-6">
        <p>Velg et nytt passord for din foreningsbruker.</p>

        {error && <p className="text-danger">{error}</p>}

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
  )
}
