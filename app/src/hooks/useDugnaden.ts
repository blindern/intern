import { useQuery } from "@tanstack/react-query"
import { getDugnadenOld } from "../server-fns/dugnaden.js"

interface DugnadPerson {
  name: string
  room: string
}

export interface DugnadDay {
  id: string
  date: string
  people: DugnadPerson[]
}

export function useDugnadenList() {
  return useQuery({
    queryKey: ["dugnaden", "old", "list"],
    queryFn: () => getDugnadenOld() as Promise<DugnadDay[]>,
  })
}
