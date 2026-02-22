import { createFileRoute } from "@tanstack/react-router"
import { PrinterInvoicingPage } from "../../features/printer/invoicing/PrinterInvoicingPage.js"

export const Route = createFileRoute("/printer/fakturere")({
  component: PrinterInvoicingPage,
})
