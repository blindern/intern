import { createFileRoute } from "@tanstack/react-router"
import { BookPage } from "../../../features/books/BookPage.js"

export const Route = createFileRoute("/books/$id/")({
  component: BookRoute,
})

function BookRoute() {
  const { id } = Route.useParams()
  return <BookPage id={id} />
}
