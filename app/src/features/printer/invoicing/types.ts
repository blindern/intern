import type { Summer } from "./Summer.js"

export interface PrinterInvoiceResponse {
  prints: {
    printername: string
    users: {
      username: string
      prints: {
        jobyear: string
        jobmonth: string
        count_jobs: number
        sum_jobsize: number
        last_jobdate: string
        username: string
        printername: string
        cost_each: number
      }[]
    }[]
  }[]
  texts: Record<string, string>
  no_faktura: string[]
  from: string
  to: string
  daily: {
    jobday: string
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
  utflyttet: string[]
}

export interface PrinterUser {
  username: string
  realname: string
  utflyttet: boolean
  months: {
    name: string
    costEach: number
    summer: Summer
  }[]
  summer: Summer
}

export interface AggregatedData {
  summer: Summer
  sections: {
    summer: Summer
    title: string
    description: string | null
    isBeboer: boolean
    printers: {
      summer: Summer
      printername: string
      comment: string | undefined
      users: PrinterUser[]
    }[]
  }[]
}
