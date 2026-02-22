import { useQuery } from "@tanstack/react-query"
import { type DugnadDay, getDugnadenOld } from "./server-fns.js"

export type { DugnadDay }

export function useDugnadenList() {
  return useQuery({
    queryKey: ["dugnaden", "old", "list"],
    queryFn: () => getDugnadenOld(),
  })
}
