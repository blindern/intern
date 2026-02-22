import { useQuery } from "@tanstack/react-query"
import {
  getPrinterLast,
  getPrinterUsage,
  getPrinterStats,
} from "./server-fns.js"

export function usePrinterLastList() {
  return useQuery({
    queryKey: ["printer", "last"],
    queryFn: () => getPrinterLast(),
  })
}

export function usePrinterInvoiceData(from: string, to: string) {
  return useQuery({
    queryKey: ["printer", "invoice", { from, to }],
    queryFn: () => getPrinterUsage({ data: { from, to } }),
  })
}

export function usePrinterStats() {
  return useQuery({
    queryKey: ["printer", "stats"],
    queryFn: () => getPrinterStats(),
    staleTime: 5 * 60 * 1000,
  })
}
