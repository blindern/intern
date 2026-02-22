import { createFileRoute } from "@tanstack/react-router"
import { ChangePasswordPage } from "../features/change-password/ChangePasswordPage.js"

export const Route = createFileRoute("/change-password")({
  component: ChangePasswordPage,
})
