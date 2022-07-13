import { useTitle } from "modules/core/title/PageTitle"
import React from "react"
import { Link } from "react-router-dom"

export function NotFoundPage() {
  useTitle("Ukjent side")

  return (
    <p>
      <Link to="/">Gå til forsiden</Link>
    </p>
  )
}
