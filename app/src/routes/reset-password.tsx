import { createFileRoute, useSearch } from "@tanstack/react-router"
import { ResetPasswordPage } from "../features/password-reset/ResetPasswordPage.js"

export const Route = createFileRoute("/reset-password")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => ({
    token: (search.token as string) ?? "",
  }),
})

function RouteComponent() {
  const { token } = useSearch({ from: "/reset-password" })
  return <ResetPasswordPage token={token} />
}
