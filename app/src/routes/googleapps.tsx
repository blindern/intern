import { createFileRoute } from "@tanstack/react-router"
import { GoogleAppsPage } from "../features/googleapps/GoogleAppsPage.js"

export const Route = createFileRoute("/googleapps")({
  component: GoogleAppsPage,
})
