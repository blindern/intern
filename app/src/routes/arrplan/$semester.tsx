import { createFileRoute } from "@tanstack/react-router"
import { ArrplanSemesterPage } from "../../features/arrplan/ArrplanSemesterPage.js"

export const Route = createFileRoute("/arrplan/$semester")({
  component: RouteComponent,
})

function RouteComponent() {
  const { semester } = Route.useParams()
  return <ArrplanSemesterPage semester={semester} />
}
