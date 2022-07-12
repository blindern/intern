import { useMemo } from "react"

let nextId = 1

export function useId() {
  return useMemo(() => `unique-${nextId++}`, [])
}
