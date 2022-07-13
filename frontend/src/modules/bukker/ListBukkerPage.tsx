import { ErrorMessages } from "components/ErrorMessages"
import { Loading } from "components/Loading"
import { orderBy } from "lodash"
import { Bukk, useBukkList } from "modules/bukker/api"
import { useTitle } from "modules/core/title/PageTitle"
import React from "react"
import { Link } from "react-router-dom"
import { bukkUrl } from "urls"

function sortValue(bukk: Bukk) {
  const newestAward = orderBy(bukk.awards, "year", "desc")[0]
  return `${newestAward.year}-${newestAward.rank}-${bukk.name}`
}

function getThumb(bukk: Bukk) {
  return orderBy(bukk.awards, "year", "desc").filter(
    (award) => award.image_preview_url,
  )[0]?.image_preview_url
}

export function ListBukkerPage() {
  useTitle("Bukker")

  const { isLoading, isError, error, data: bukker } = useBukkList()

  if (isLoading) {
    return <Loading />
  }

  if (isError && bukker == null) {
    return <ErrorMessages error={error} />
  }

  let countHoy = 0
  let countHelOnly = 0
  let countHelAll = 0
  let countHalvOnly = 0
  let countHalvAll = 0

  for (const bukk of bukker) {
    const hoy = bukk.awards.some((award) => award.rank === "Høy")
    const hel = bukk.awards.some((award) => award.rank === "Hel")
    const halv = bukk.awards.some((award) => award.rank === "Halv")

    if (hoy) {
      countHoy++
    }

    if (hel) {
      countHelAll++
      if (!hoy) {
        countHelOnly++
      }
    }

    if (halv) {
      countHalvAll++
      if (!hoy && !hel) {
        countHalvOnly++
      }
    }
  }

  const bukkerSorted = orderBy(bukker, (bukk) => sortValue(bukk), "desc")

  return (
    <div className="bukker">
      <p>
        Totalt {bukker!.length} bukker er registrert. {countHoy} høyheter,{" "}
        {countHelOnly} ({countHelAll}) helheter og {countHalvOnly} (
        {countHalvAll}) halvheter.
      </p>
      <div className="bukker-list">
        {bukkerSorted.map((bukk) => {
          const thumb = getThumb(bukk)
          const awards = orderBy(bukk.awards, "year", "desc")

          return (
            <div key={bukk._id} className="bukk">
              <Link to={bukkUrl(bukk._id)}>
                <div className="bukkdata">
                  <div className="name">{bukk.name}</div>
                  <div className="awards">
                    {thumb && (
                      <span className="thumb">
                        <img src={thumb} alt="" />
                      </span>
                    )}
                    {awards.map((award, idx) => (
                      <span key={idx} className="award">
                        {idx > 0 && ", "}
                        {award.rank} {award.year}
                      </span>
                    ))}
                  </div>
                  {bukk.died && (
                    <div className="died">
                      Død{bukk.died !== true && <> {bukk.died}</>}
                    </div>
                  )}
                </div>
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}
