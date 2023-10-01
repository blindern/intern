import React from "react"
import { Link } from "react-router-dom"
import { groupUrl } from "utils/urls.js"

export function NoAuth() {
  return (
    <p>
      Denne siden er kun tilgjengelig for{" "}
      <Link to={groupUrl("biblioteksutvalget")}>biblioteksutvalget</Link>.
    </p>
  )
}
