import { useApiService } from "modules/core/api/ApiServiceProvider.js"
import { NotAuthedError, ResponseError } from "modules/core/api/errors.js"
import { RedirectToLogin } from "modules/core/auth/RedirectToLogin.js"
import { FlashArgs } from "modules/core/flashes/FlahesService.js"
import { useMemo } from "react"

export function ErrorMessages({ error }: { error: unknown }) {
  const apiService = useApiService()

  const messages: FlashArgs[] = useMemo(() => {
    if (error instanceof ResponseError) {
      return apiService.errorToMessages(error)
    } else {
      return [
        {
          type: "danger",
          message: `Ukjent feil: ${String(error)}`,
        },
      ]
    }
  }, [apiService, error])

  return (
    <>
      {messages.map((message, idx) => (
        <p key={idx} style={{ color: "red" }}>
          {message.message}
        </p>
      ))}

      {error instanceof NotAuthedError && <RedirectToLogin />}
    </>
  )
}
