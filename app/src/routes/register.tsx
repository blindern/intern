import { createFileRoute } from "@tanstack/react-router"
import { RegisterUserPage } from "../features/registration/RegisterUserPage.js"

export const Route = createFileRoute("/register")({
  component: RegisterUserPage,
})
