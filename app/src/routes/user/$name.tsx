import { createFileRoute } from "@tanstack/react-router"
import { UserPage } from "../../features/users/UserPage.js"

export const Route = createFileRoute("/user/$name")({
  component: UserRoute,
})

function UserRoute() {
  const { name } = Route.useParams()
  return <UserPage name={name} />
}
