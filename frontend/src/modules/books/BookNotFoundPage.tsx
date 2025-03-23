import { PageTitle } from "modules/core/title/PageTitle.js"
import { Link } from "react-router-dom"
import { listBooksUrl } from "utils/urls.js"

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
