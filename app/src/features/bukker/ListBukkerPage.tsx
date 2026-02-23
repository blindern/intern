import { Link } from "@tanstack/react-router"
import { ErrorMessages } from "../../components/ErrorMessages.js"
import { Loading } from "../../components/Loading.js"

import { type Bukk, useBukkList } from "./hooks.js"
import { PageTitle } from "../../hooks/useTitle.js"

const byYearDesc = (a: { year: string }, b: { year: string }) =>
  b.year.localeCompare(a.year)

function sortValue(bukk: Bukk) {
  const newestAward = [...bukk.awards].sort(byYearDesc)[0]
  return `${newestAward.year}-${newestAward.rank}-${bukk.name}`
}

function getThumb(bukk: Bukk) {
  return [...bukk.awards]
    .sort(byYearDesc)
    .find((award) => award.image_preview_url)?.image_preview_url
}

export function ListBukkerPage() {
  const { isPending, isError, error, data: bukker } = useBukkList()

  if (isPending)
    return (
      <>
        <PageTitle title="Bukker" />
        <Loading />
      </>
    )
  if (isError && bukker == null)
    return (
      <>
        <PageTitle title="Bukker" />
        <ErrorMessages error={error} />
      </>
    )

  let countHoy = 0,
    countHelOnly = 0,
    countHelAll = 0,
    countHalvOnly = 0,
    countHalvAll = 0

  for (const bukk of bukker) {
    const hoy = bukk.awards.some((a) => a.rank === "Høy")
    const hel = bukk.awards.some((a) => a.rank === "Hel")
    const halv = bukk.awards.some((a) => a.rank === "Halv")
    if (hoy) countHoy++
    if (hel) {
      countHelAll++
      if (!hoy) countHelOnly++
    }
    if (halv) {
      countHalvAll++
      if (!hoy && !hel) countHalvOnly++
    }
  }

  const bukkerSorted = [...bukker].sort((a, b) =>
    sortValue(b).localeCompare(sortValue(a)),
  )

  return (
    <>
      <PageTitle title="Bukker" />
      <div className="bukker">
        <p>
          Totalt {bukker.length} bukker er registrert. {countHoy} høyheter,{" "}
          {countHelOnly} ({countHelAll}) helheter og {countHalvOnly} (
          {countHalvAll}) halvheter.
        </p>
        <div className="bukker-list">
          {bukkerSorted.map((bukk) => {
            const thumb = getThumb(bukk)
            const awards = [...bukk.awards].sort(byYearDesc)
            return (
              <div key={bukk.id} className="bukk">
                <Link to="/bukker/$id" params={{ id: bukk.id }}>
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
    </>
  )
}
