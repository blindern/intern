import { PageTitle } from "modules/core/title/PageTitle"
import React from "react"
import { Link } from "react-router-dom"
import { listBooksUrl } from "urls"

export function BookNotFoundPage() {
  return (
    <>
      <PageTitle title="Ukjent bok" />
      <p>Boken er ikke registrert</p>
      <p>
        <Link to={listBooksUrl()}>Til oversikten</Link>
      </p>
    </>
  )
}
