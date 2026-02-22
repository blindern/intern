import { createFileRoute } from "@tanstack/react-router"
import { ListBooksPage } from "../../features/books/ListBooksPage.js"

export const Route = createFileRoute("/books/")({
  component: ListBooksPage,
})
