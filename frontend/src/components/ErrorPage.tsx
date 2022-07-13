import { ErrorMessages } from "components/ErrorMessages"
import { PageTitle } from "modules/core/title/PageTitle"
import React from "react"

export const ErrorPage = ({
  title = "Feil ved lasting av data",
  error,
}: {
  title?: string
  error: unknown
}) => (
  <>
    <PageTitle title={title} />
    <ErrorMessages error={error} />
  </>
)
