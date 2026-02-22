import { createFileRoute } from "@tanstack/react-router"
import { ListBukkerPage } from "../../features/bukker/ListBukkerPage.js"

export const Route = createFileRoute("/bukker/")({
  component: ListBukkerPage,
})
