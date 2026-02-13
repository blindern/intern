import { useTitle } from "modules/core/title/PageTitle.js"
import { useState } from "react"
import { useChangePasswordMutation } from "./api.js"

export const ChangePasswordPage = () => {
  useTitle("Endre passord")

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [isDone, setIsDone] = useState(false)
  const { isPending, mutateAsync: changePassword } = useChangePasswordMutation()

  if (isDone) {
    return (
      <div className="row">
        <div className="col-md-6">
          <p>Passordet er oppdatert.</p>
        </div>
      </div>
    )
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      await changePassword({ currentPassword, newPassword })
      setIsDone(true)
    } catch {
      // Errors shown via flash system automatically
    }
  }

  return (
    <div className="row">
      <div className="col-md-6">
        <form onSubmit={onSubmit} className="form-horizontal" role="form">
          <div className="form-group">
            <label
              htmlFor="current_password"
              className="col-lg-4 control-label"
            >
              Nåværende passord
            </label>
            <div className="col-lg-8">
              <input
                type="password"
                className="form-control"
                id="current_password"
                placeholder="Nåværende passord"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                autoFocus
              />
            </div>
          </div>
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
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={8}
                required
              />
              <span className="help-block">Minst 8 tegn.</span>
            </div>
          </div>
          <div className="form-group">
            <div className="col-lg-offset-4 col-lg-8">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isPending || newPassword.length < 8}
              >
                {isPending ? "Oppdaterer..." : "Endre passord"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
