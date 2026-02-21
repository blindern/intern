import classNames from "classnames"
import { createFileRoute, Link } from "@tanstack/react-router"
import { ErrorMessages } from "../../components/ErrorMessages.js"
import { Loading } from "../../components/Loading.js"
import {
  type EventItem,
  type NormalEvent,
  type Semester,
  getSemesterListFromEvent,
  useArrplanList,
} from "../../features/arrplan/hooks.js"
import { PageTitle } from "../../hooks/useTitle.js"
import { moment } from "../../utils/dates.js"
import { Fragment } from "react"

export const Route = createFileRoute("/arrplan/$semester")({
  component: ArrplanPage,
})

const getSemesterList = (list: EventItem[]) => {
  const hashed: Record<string, Semester> = {}
  for (const event of list) {
    for (const s of getSemesterListFromEvent(event)) {
      hashed[s.id] = s
    }
  }
  return Object.values(hashed)
    .map(({ id, semester, year }) => ({
      id,
      text: `${semester === "h" ? "Høst" : "Vår"} ${year}`,
      sortKey: `${year}-${semester === "v" ? "0" : "1"}`,
    }))
    .sort((a, b) => b.sortKey.localeCompare(a.sortKey))
}

const filterBySemester = (list: EventItem[], semesterId: string) =>
  list.filter((event) =>
    getSemesterListFromEvent(event).some((s) => s.id === semesterId),
  )

const recurSortKey = (event: NormalEvent) => {
  const start = moment(event.start)
  return ((start.day() + 6) % 7) * 10000 + start.hours() * 100 + start.minutes()
}

function EventTitle({ event }: { event: NormalEvent }) {
  return (
    <>
      {event.title}
      {event.by && (
        <>
          {" "}
          <span style={{ color: "#AAA" }}>[{event.by}]</span>
        </>
      )}
    </>
  )
}

function List({ semesterId, list }: { semesterId: string; list: EventItem[] }) {
  const semesters = getSemesterList(list)
  const activeSemester = semesters.find((s) => s.id === semesterId)
  const filtered = activeSemester ? filterBySemester(list, semesterId) : []

  const events = filtered.filter((e): e is NormalEvent => e.type === "event")
  const recurring = filtered
    .filter((e): e is NormalEvent => e.type === "event" && !!e.recur)
    .sort((a, b) => recurSortKey(a) - recurSortKey(b))
  const comments = filtered.filter((e) => e.type === "comment")

  return (
    <div className="arrplan-container">
      <p>
        <a href="https://foreningenbs.no/confluence/display/BS/Arrangementplan">
          Rediger
        </a>
      </p>

      <ul className="arrplan-semester-list" role="tablist">
        {semesters.map((s) => (
          <li key={s.id} className={s === activeSemester ? "active" : ""}>
            <Link to="/arrplan/$semester" params={{ semester: s.id }}>
              {s.text}
            </Link>
          </li>
        ))}
      </ul>

      {events.length > 0 && (
        <>
          <h3>Arrangementer</h3>
          {events.map((event, idx) => (
            <div
              key={idx}
              className={classNames("row", {
                oldHappening: event.expired,
                lowPriority: event.priority === "low",
                highPriority: event.priority === "high",
              })}
            >
              <div className="col-sm-3 arrplan-event-date">
                {event.duration}
              </div>
              <div className="col-sm-9">
                <EventTitle event={event} />
              </div>
            </div>
          ))}
        </>
      )}

      {recurring.length > 0 && (
        <>
          <h3>Øvrige aktiviteter</h3>
          <div className="alert alert-warning">
            <strong>OBS!</strong> Denne oversikten inneholder arrangementer som
            har vært avholdt også tidligere i semesteret og som ikke lenger
            avholdes. Se{" "}
            <a href="https://foreningenbs.no/confluence/display/BS/Arrangementplan">
              kalenderen på wiki
            </a>{" "}
            for en mer nøyaktig oversikt.
          </div>
          {recurring.map((event, idx) => (
            <div key={idx} className="row">
              <div className="col-sm-3 arrplan-event-date">
                {event.duration}
              </div>
              <div className="col-sm-9">
                <EventTitle event={event} />
              </div>
            </div>
          ))}
        </>
      )}

      {comments.length > 0 && (
        <>
          <h3>Kommentarer</h3>
          <dl>
            {comments.map((c, idx) => (
              <Fragment key={idx}>
                <dt>{c.type === "comment" ? c.date : ""}</dt>
                <dd>{c.type === "comment" ? c.comment : ""}</dd>
              </Fragment>
            ))}
          </dl>
        </>
      )}

      <h2>Google Calendar, kalender på mobil, o.l.</h2>
      <p>
        Du kan få kalenderen automatisk inn i Google Calender eller en annen
        kalender du måtte ha. For dette trenger du å legge inn denne adressen i
        kalenderen din:
        <br />
        <a href="/intern/arrplan.ics">
          https://foreningenbs.no/intern/arrplan.ics
        </a>{" "}
        <i>(kopier lenken, ikke last ned)</i>
      </p>
      <p>Slik gjør du det for Google Calendar:</p>
      <p style={{ textAlign: "center" }}>
        <img
          src="/intern/assets/images/arrplan/googlecal.png"
          className="img-responsive img-thumbnail"
          alt="Eksempel med Google Calendar"
        />
      </p>
    </div>
  )
}

function ArrplanPage() {
  const { semester } = Route.useParams()
  const { isPending, isError, error, data } = useArrplanList()

  if (isPending)
    return (
      <>
        <PageTitle title="Arrangementplan" />
        <Loading />
      </>
    )
  if (isError && data == null)
    return (
      <>
        <PageTitle title="Arrangementplan" />
        <ErrorMessages error={error} />
      </>
    )

  return (
    <>
      <PageTitle title="Arrangementplan" />
      <List semesterId={semester} list={data} />
    </>
  )
}
