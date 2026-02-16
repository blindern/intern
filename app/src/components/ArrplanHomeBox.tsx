import classNames from "classnames"
import { ErrorMessages } from "./ErrorMessages.js"
import { Loading } from "./Loading.js"
import { Link } from "@tanstack/react-router"
import { arrplanUrl } from "../utils/urls.js"
import { useArrplanNext } from "../hooks/useArrplan.js"

export const ArrplanHomeBox = () => {
  const { isPending, isError, error, data: arrplan } = useArrplanNext()

  return (
    <Link to={arrplanUrl()} className="index-arrplan">
      <h4>Neste på arrangementplanen</h4>
      {isPending ? (
        <Loading />
      ) : isError && arrplan == null ? (
        <ErrorMessages error={error} />
      ) : (
        arrplan.map((event, idx) =>
          event.type === "event" ? (
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
            <p key={idx}>Ukjent</p>
          ),
        )
      )}
    </Link>
  )
}
