import { createFileRoute } from "@tanstack/react-router"
import { EditBookPage } from "../../../features/books/EditBookPage.js"

export const Route = createFileRoute("/books/$id/edit")({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  return <EditBookPage id={id} />
}
