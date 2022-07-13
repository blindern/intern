import classNames from "classnames"
import { ErrorMessages as ErrorMessages } from "components/ErrorMessages"
import { Loading } from "components/Loading"
import React from "react"
import { Link } from "react-router-dom"
import { useArrplanNext } from "./api"

export const ArrplanHomeBox = () => {
  const { isLoading, isError, error, data: arrplan } = useArrplanNext()

  return (
    <Link to="/arrplan" className="index-arrplan">
      <h4>Neste på arrangementplanen</h4>
      {isLoading ? (
        <Loading />
      ) : isError && arrplan == null ? (
        <ErrorMessages error={error} />
      ) : (
        arrplan.map((event, idx) =>
          event.type === "event" || event.type === "event_recurring" ? (
            <p
              key={idx}
              className={classNames({
                oldHappening: event.expired,
                lowPriority: event.priority === "low",
                highPriority: event.priority === "high",
              })}
            >
              <span className="text-muted">{event.duration}:</span>{" "}
              {event.title}
            </p>
          ) : (
            <p>Ukjent</p>
          ),
        )
      )}
    </Link>
  )
}
