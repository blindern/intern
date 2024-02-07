import { useApiService } from "modules/core/api/ApiServiceProvider.js"
import { useQuery } from "@tanstack/react-query"

export interface DugnadDay {
  checked: "0" | "1"
  date: string // YYYY-MM-DD 00:00:00
  deleted: "0" | "1"
  id: string
  people: DugnadPerson[]
  type: string
}

export interface DugnadPerson {
  done: "0" | "1"
  name: string
  room: string
  type: string
}

export function useDugnadenList() {
  const api = useApiService()
  return useQuery({
    queryKey: ["dugnaden", "old", "list"],

    queryFn: async () => {
      const response = await api.get("dugnaden/old")
      return (await response.json()) as DugnadDay[]
    },
  })
}
