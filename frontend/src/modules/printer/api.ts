import { get } from 'api'
import { useQuery } from 'react-query'

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
  texts: {
    [printername: string]: string
  }
  no_faktura: string[]
  from: string
  to: string
  daily: {
    jobday: string // 2022-06-01
    count_jobs: number
    sum_jobsize: number
  }[]
  sections: {
    [section: string]: {
      printers: string[]
      is_beboer: boolean
      title: string
      description: string
    }
  }
  section_default: string
  accounts: {
    printers: string[] | null
    account: string | number
    text: string
  }[]
  realnames: {
    [username: string]: string
  }
  utflyttet: [username: string]
}

export function usePrinterLastList() {
  return useQuery(['printer', 'last'], async () => {
    const response = await get('printer/last')
    return (await response.json()) as LastPrintItem[]
  })
}

export function usePrinterInvoiceData(from: string, to: string) {
  return useQuery(['printer', 'invoice', { from, to }], async () => {
    const response = await get(
      `printer/fakturere?from=${encodeURIComponent(
        from,
      )}&to=${encodeURIComponent(to)}`,
    )
    return (await response.json()) as PrinterInvoiceResponse
  })
}
