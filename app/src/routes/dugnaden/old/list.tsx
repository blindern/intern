import { createFileRoute } from "@tanstack/react-router"
import { DugnadsinnkallingerPage } from "../../../features/dugnaden/DugnadsinnkallingerPage.js"

export const Route = createFileRoute("/dugnaden/old/list")({
  component: DugnadsinnkallingerPage,
})
