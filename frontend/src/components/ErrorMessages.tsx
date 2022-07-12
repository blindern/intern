import { useApiService } from "modules/core/api/ApiServiceProvider"
import { NotAuthedError, ResponseError } from "modules/core/api/errors"
import { RedirectToLogin } from "modules/core/auth/RedirectToLogin"
import { FlashArgs } from "modules/core/flashes/FlahesService"
import React, { useMemo } from "react"

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
  }, [error])

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
