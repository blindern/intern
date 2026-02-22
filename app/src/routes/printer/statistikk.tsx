import { createFileRoute } from "@tanstack/react-router"
import { PrinterStatsPage } from "../../features/printer/stats/PrinterStatsPage.js"

export const Route = createFileRoute("/printer/statistikk")({
  component: PrinterStatsPage,
})
