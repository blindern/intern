import { useTitle } from "modules/core/title/PageTitle"
import React from "react"
import { Link } from "react-router-dom"
import { homeUrl } from "urls"

export function NotFoundPage() {
  useTitle("Ukjent side")

  return (
    <p>
      <Link to={homeUrl()}>Gå til forsiden</Link>
    </p>
  )
}
