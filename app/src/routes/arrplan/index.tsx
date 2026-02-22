import { Navigate, createFileRoute } from "@tanstack/react-router"
import { getSemesterFromDate } from "../../features/arrplan/hooks.js"
import { moment } from "../../utils/dates.js"

export const Route = createFileRoute("/arrplan/")({
  component: ArrplanRedirect,
})

function ArrplanRedirect() {
  const semester = getSemesterFromDate(moment())
  return <Navigate to="/arrplan/$semester" params={{ semester: semester.id }} />
}
