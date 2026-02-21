export function toISODateString(d: Date): string {
  return d.toISOString().split("T")[0]
}
