import { createFileRoute } from "@tanstack/react-router"
import { ListUsersPage } from "../../features/users/ListUsersPage.js"

export const Route = createFileRoute("/users/")({
  component: ListUsersPage,
})
