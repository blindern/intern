import { ErrorMessages } from "components/ErrorMessages"
import { Loading } from "components/Loading"
import React from "react"
import { Link } from "react-router-dom"
import { matmenyUrl } from "urls"
import { formatDate } from "utils/dates"
import { MatmenyDay, useMatmenyHomeData } from "./api"

const MatmenyDayItem = ({ data }: { data?: MatmenyDay }) => {
  if (!data) return <>Ukjent</>

  return (
    <>
      {(data.dishes ?? []).join(", ")}
      {data.text && <span style={{ color: "#FF0000" }}> ({data.text})</span>}
    </>
  )
}

export const MatmenyHomeBox = () => {
  const { isLoading, isError, error, data: matmeny } = useMatmenyHomeData()

  return (
    <Link to={matmenyUrl()} className="index-matmeny">
      <h4>Matmeny</h4>
      {isLoading ? (
        <Loading />
      ) : isError && !matmeny ? (
        <ErrorMessages error={error} />
      ) : (
        <>
          <p className="day">
            <b>Dagens matrett</b> ({formatDate(matmeny.today.date, "dddd")}):
            <br />
            <MatmenyDayItem data={matmeny.today.data} />
          </p>
          <p>
            I morgen, {formatDate(matmeny.tomorrow.date, "dddd")}:<br />
            <MatmenyDayItem data={matmeny.tomorrow.data} />
          </p>
        </>
      )}
      <p className="text-muted">
        <i>(Oppdateres ukentlig av kjøkkensjefen.)</i>
      </p>
    </Link>
  )
}
