import { Link } from "@tanstack/react-router"
import { ErrorMessages } from "../../components/ErrorMessages.js"
import { Loading } from "../../components/Loading.js"
import { orderBy } from "lodash"
import { useBukk } from "./hooks.js"
import { PageTitle } from "../../hooks/useTitle.js"

export function BukkPage({ id }: { id: string }) {
  const { isPending, isError, error, data: bukk } = useBukk(id)

  if (isPending)
    return (
      <>
        <PageTitle title="Laster bukk ..." />
        <Loading />
      </>
    )
  if (bukk == null && !isPending && !isError)
    return (
      <>
        <PageTitle title="Ukjent bukk" />
        <p>Oppføringen er ikke registrert</p>
        <p>
          <Link to="/bukker">Til oversikten</Link>
        </p>
      </>
    )
  if (isError && bukk == null)
    return (
      <>
        <PageTitle title="Feil" />
        <ErrorMessages error={error} />
      </>
    )

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
