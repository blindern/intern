import { PageTitle } from "modules/core/title/PageTitle"
import React from "react"
import { Link } from "react-router-dom"
import { booksUrl } from "urls"

export function BookNotFoundPage() {
  return (
    <>
      <PageTitle title="Ukjent bok" />
      <p>Boken er ikke registrert</p>
      <p>
        <Link to={booksUrl()}>Til oversikten</Link>
      </p>
    </>
  )
}
