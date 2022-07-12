import { orderBy } from "lodash"
import { useBukk } from "modules/bukker/api"
import { useTitle } from "modules/core/title/PageTitle"
import React from "react"
import { useParams } from "react-router-dom"

export function BukkPage() {
  const { id } = useParams()
  const { isFetching, data: bukk } = useBukk(id!)

  useTitle(bukk?.name ?? "Bukk")

  if (!bukk && isFetching) {
    return <p>Henter data...</p>
  }

  if (!bukk) {
    return <p>Klarte ikke å hente data</p>
  }

  const awards = orderBy(bukk.awards, "year", "desc")

  return (
    <div className="bukker-bukk">
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
