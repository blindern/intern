import { useApiService } from "modules/core/api/ApiServiceProvider.js"
import { useQuery } from "@tanstack/react-query"

export interface Bukk {
  id: string
  name: string
  awards: {
    id: string
    year: number
    rank: string
    image_preview_url: string | null
    image_url: string | null
    devise?: string | null
  }[]
  died?: boolean | number
}

export function useBukkList() {
  const api = useApiService()
  return useQuery({
    queryKey: ["bukker", "list"],

    queryFn: async () => {
      const response = await api.get("bukker")
      return (await response.json()) as Bukk[]
    },
  })
}

export function useBukk(id: string) {
  const api = useApiService()
  return useQuery({
    queryKey: ["bukker", "item", id],

    queryFn: async () => {
      const response = await api.get("bukker/" + encodeURIComponent(id))
      return (await response.json()) as Bukk
    },
  })
}
