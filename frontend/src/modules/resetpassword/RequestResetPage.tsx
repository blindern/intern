import { useTitle } from "modules/core/title/PageTitle.js"
import { useState } from "react"
import { useRequestPasswordResetMutation } from "./api.js"

export const RequestResetPage = () => {
  useTitle("Glemt passord")

  const [email, setEmail] = useState("")
  const [isSent, setIsSent] = useState(false)
  const { isPending, mutateAsync: requestReset } =
    useRequestPasswordResetMutation()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      await requestReset(email)
      setIsSent(true)
    } catch {
      // Error flash is already shown by ApiService.handleErrors
    }
  }

  if (isSent) {
    return (
      <div className="row">
        <div className="col-md-6">
          <p>
            En lenke for å tilbakestille passordet er sendt til din
            e-postadresse.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="row">
      <div className="col-md-6">
        <p>
          Skriv inn e-postadressen knyttet til din foreningsbruker, så sender vi
          deg en lenke for å tilbakestille passordet.
        </p>

        <form onSubmit={onSubmit} className="form-horizontal" role="form">
          <div className="form-group">
            <label htmlFor="reset_email" className="col-lg-4 control-label">
              E-post
            </label>
            <div className="col-lg-8">
              <input
                type="email"
                className="form-control"
                id="reset_email"
                placeholder="E-postadresse"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
          </div>
          <div className="form-group">
            <div className="col-lg-offset-4 col-lg-8">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isPending || !email}
              >
                {isPending ? "Sender..." : "Send tilbakestillingslenke"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
