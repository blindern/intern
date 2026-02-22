import { createFileRoute } from "@tanstack/react-router"
import { LastPrintsPage } from "../../features/printer/LastPrintsPage.js"

export const Route = createFileRoute("/printer/siste")({
  component: LastPrintsPage,
})
