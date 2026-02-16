export function ErrorMessages({ error }: { error: unknown }) {
  const message = error instanceof Error ? error.message : String(error)

  return <p style={{ color: "red" }}>{message || "Ukjent feil"}</p>
}
