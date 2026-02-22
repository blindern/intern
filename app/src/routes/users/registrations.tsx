import { createFileRoute } from "@tanstack/react-router"
import { RegistrationRequestsPage } from "../../features/registration/RegistrationRequestsPage.js"

export const Route = createFileRoute("/users/registrations")({
  component: RegistrationRequestsPage,
})
