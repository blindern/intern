import { createFileRoute } from "@tanstack/react-router"
import { ListGroupsPage } from "../features/groups/ListGroupsPage.js"

export const Route = createFileRoute("/groups")({
  component: ListGroupsPage,
})
