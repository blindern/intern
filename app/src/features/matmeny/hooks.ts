import { useMutation, useQuery } from "@tanstack/react-query"
import { getMatmeny, storeMatmeny, convertMatmenyFile } from "./server-fns.js"
import { moment } from "../../utils/dates.js"

export interface MatmenyDay {
  day: string
  dishes: string[] | null
  text: string | null
}

export function buildMatmenyDataKey(from: string, to: string) {
  return ["matmeny", "list", { from, to }]
}

export function useMatmenyHomeData() {
  return useQuery({
    queryKey: ["matmeny", "home-data"],
    queryFn: async () => {
      const today = moment().format("YYYY-MM-DD")
      const tomorrow = moment().add(1, "days").format("YYYY-MM-DD")
      const data = await getMatmeny({ data: { from: today, to: tomorrow } })
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
    },
  })
}

export function useMatmenyData(from: string, to: string) {
  return useQuery({
    queryKey: buildMatmenyDataKey(from, to),
    queryFn: () => getMatmeny({ data: { from, to } }),
  })
}

export function useUpdateMatmenyDaysMutation() {
  return useMutation({
    mutationFn: async (
      days: { day: string; dishes?: string[] | null; text?: string | null }[],
    ) => {
      return storeMatmeny({ data: { days } })
    },
  })
}

export function useConvertMatmenyDocMutation() {
  return useMutation({
    mutationFn: async (file: File) => {
      const bytes = new Uint8Array(await file.arrayBuffer())
      let binary = ""
      for (const byte of bytes) {
        binary += String.fromCharCode(byte)
      }
      return convertMatmenyFile({ data: { fileBase64: btoa(binary) } })
    },
  })
}
