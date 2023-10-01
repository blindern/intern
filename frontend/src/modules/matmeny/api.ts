import { useApiService } from "modules/core/api/ApiServiceProvider.js"
import { useMutation, useQuery } from "@tanstack/react-query"
import moment from "utils/moment.js"

export interface MatmenyDay {
  day: string // YYYY-MM-DD
  dishes: string[] | null
  text: string | null
}

export function useMatmenyHomeData() {
  const api = useApiService()
  return useQuery(["matmeny", "home-data"], async () => {
    const today = moment().format("YYYY-MM-DD")
    const tomorrow = moment().add(1, "days").format("YYYY-MM-DD")

    const response = await api.get(`matmeny?from=${today}&to=${tomorrow}`)
    const data = (await response.json()) as MatmenyDay[]

    return {
      today: {
        date: today,
        data: data.find((item) => item.day === today),
      },
      tomorrow: {
        date: tomorrow,
        data: data.find((item) => item.day === tomorrow),
      },
    }
  })
}

export function useMatmenyData(from: string, to: string) {
  const api = useApiService()
  return useQuery(buildMatmenyDataKey(from, to), async () => {
    const response = await api.get(
      `matmeny?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
    )
    return (await response.json()) as MatmenyDay[]
  })
}

export function buildMatmenyDataKey(from: string, to: string) {
  return ["matmeny", "list", { from, to }]
}

export function useUpdateMatmenyDaysMutation() {
  const api = useApiService()
  return useMutation(async (days: MatmenyDay[]) => {
    const response = await api.post("matmeny", {
      days,
    })
    return (await response.json()) as MatmenyDay[]
  })
}

export function useConvertMatmenyDocMutation() {
  const api = useApiService()
  return useMutation(async (file: File) => {
    const formData = new FormData()
    formData.append("file", file)
    const response = await api.upload("matmeny/convert", formData)
    return (await response.json()) as Record<number, string[]>
  })
}
