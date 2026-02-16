import { Link } from "@tanstack/react-router"
import { PageTitle } from "../hooks/useTitle.js"
import { homeUrl } from "../utils/urls.js"

export function NotFoundPage() {
  return (
    <>
      <PageTitle title="Ukjent side" />
      <p>
        <Link to={homeUrl()}>Gå til forsiden</Link>
      </p>
    </>
  )
}
