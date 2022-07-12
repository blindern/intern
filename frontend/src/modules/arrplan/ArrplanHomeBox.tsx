import classNames from "classnames"
import React from "react"
import { Link } from "react-router-dom"
import { useArrplanNext } from "./api"

export const ArrplanHomeBox = () => {
  const { isFetching, isSuccess, data: arrplan } = useArrplanNext()

  return (
    <Link to="/arrplan" className="index-arrplan">
      <h4>Neste på arrangementplanen</h4>
      {isFetching ? (
        <div>Laster...</div>
      ) : !isSuccess ? (
        <div>Error</div>
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
