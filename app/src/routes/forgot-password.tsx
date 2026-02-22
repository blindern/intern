import { createFileRoute } from "@tanstack/react-router"
import { ForgotPasswordPage } from "../features/password-reset/ForgotPasswordPage.js"

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,
})
