import { useApiService } from "modules/core/api/ApiServiceProvider"
import { useQuery } from "react-query"

export interface Bukk {
  _id: string
  name: string
  awards: {
    _id: string
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
  return useQuery(["bukker", "list"], async () => {
    const response = await api.get("bukker")
    return (await response.json()) as Bukk[]
  })
}

export function useBukk(id: string) {
  const api = useApiService()
  return useQuery(["bukker", "item", id], async () => {
    const response = await api.get("bukker/" + encodeURIComponent(id))
    return (await response.json()) as Bukk
  })
}
