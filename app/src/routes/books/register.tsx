import { createFileRoute } from "@tanstack/react-router"
import { RegisterBookPage } from "../../features/books/RegisterBookPage.js"

export const Route = createFileRoute("/books/register")({
  component: RegisterBookPage,
})
