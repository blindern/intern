import { createFileRoute } from "@tanstack/react-router"
import { MatmenyPage } from "../features/matmeny/MatmenyPage.js"

export const Route = createFileRoute("/matmeny")({
  component: MatmenyPage,
})
