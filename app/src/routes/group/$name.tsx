import { createFileRoute } from "@tanstack/react-router"
import { GroupPage } from "../../features/users/GroupPage.js"

export const Route = createFileRoute("/group/$name")({
  component: GroupRoute,
})

function GroupRoute() {
  const { name } = Route.useParams()
  return <GroupPage name={name} />
}
