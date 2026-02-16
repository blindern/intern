import { useQuery } from "@tanstack/react-query"
import { getBukker, getBukk } from "../server-fns/bukker.js"

export type Bukk = Awaited<ReturnType<typeof getBukk>>

export function useBukkList() {
  return useQuery({
    queryKey: ["bukker", "list"],
    queryFn: () => getBukker(),
  })
}

export function useBukk(id: string) {
  return useQuery({
    queryKey: ["bukker", "item", id],
    queryFn: () => getBukk({ data: { id } }),
  })
}
