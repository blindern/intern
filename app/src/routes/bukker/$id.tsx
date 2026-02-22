import { createFileRoute } from "@tanstack/react-router"
import { BukkPage } from "../../features/bukker/BukkPage.js"

export const Route = createFileRoute("/bukker/$id")({
  component: BukkRoute,
})

function BukkRoute() {
  const { id } = Route.useParams()
  return <BukkPage id={id} />
}
