import { ErrorPage } from "components/ErrorPage.js"
import { LoadingPage } from "components/LoadingPage.js"
import { orderBy } from "lodash"
import { useBukk } from "modules/bukker/api.js"
import { NotFoundError } from "modules/core/api/errors.js"
import { PageTitle } from "modules/core/title/PageTitle.js"
import React from "react"
import { Link, useParams } from "react-router-dom"
import { listBukkerUrl } from "utils/urls.js"

export function BukkPage() {
  const { id } = useParams()
  const { isPending, isError, error, data: bukk } = useBukk(id!)

  if (error instanceof NotFoundError) {
    return (
      <>
        <PageTitle title="Ukjent bukk" />
        <p>Oppføringen er ikke registrert</p>
        <p>
          <Link to={listBukkerUrl()}>Til oversikten</Link>
        </p>
      </>
    )
  }

  if (isPending) {
    return <LoadingPage title="Laster bukk ..." />
  }

  if (isError && bukk == null) {
    return <ErrorPage error={error} />
  }

  const awards = orderBy(bukk.awards, "year", "desc")

  return (
    <div className="bukker-bukk">
      <PageTitle title={bukk.name} />

      {bukk.died && (
        <div className="died">Død{bukk.died !== true && <> {bukk.died}</>}</div>
      )}

      <div className="awards">
        {awards.map((award, idx) => (
          <div key={idx} className="award">
            <h2>
              {award.rank} {award.year}
            </h2>
            {award.image_preview_url && (
              <div className="thumb">
                <img src={award.image_preview_url} alt="" />
              </div>
            )}
            {award.devise && <div className="devise">{award.devise}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}
