import { useApiService } from "modules/core/api/ApiServiceProvider"
import { useQuery } from "react-query"

export interface LastPrintItem {
  jobdate: string
  jobsize: number
  printername: string
  realname: string | null
  username: string
}

export interface PrinterInvoiceResponse {
  prints: {
    printername: string
    users: {
      username: string
      prints: {
        jobyear: string
        jobmonth: string // "06"
        count_jobs: number
        sum_jobsize: number
        last_jobdate: string // "2022-06-10 18:32:26.696257"
        username: string
        printername: string // "beboer"
        cost_each: number // 0.4
      }[]
    }[]
  }[]
  texts: Record<string, string>
  no_faktura: string[]
  from: string
  to: string
  daily: {
    jobday: string // 2022-06-01
    count_jobs: number
    sum_jobsize: number
  }[]
  sections: Record<
    string,
    {
      printers: string[]
      is_beboer: boolean
      title: string
      description: string
    }
  >
  section_default: string
  accounts: {
    printers: string[] | null
    account: string | number
    text: string
  }[]
  realnames: Record<string, string>
  utflyttet: [username: string]
}

export function usePrinterLastList() {
  const api = useApiService()
  return useQuery(["printer", "last"], async () => {
    const response = await api.get("printer/last")
    return (await response.json()) as LastPrintItem[]
  })
}

export function usePrinterInvoiceData(from: string, to: string) {
  const api = useApiService()
  return useQuery(["printer", "invoice", { from, to }], async () => {
    const response = await api.get(
      `printer/fakturere?from=${encodeURIComponent(
        from,
      )}&to=${encodeURIComponent(to)}`,
    )
    return (await response.json()) as PrinterInvoiceResponse
  })
}
