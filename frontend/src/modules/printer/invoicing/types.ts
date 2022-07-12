import { Summer } from "modules/printer/invoicing/utils"

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

export interface Data {
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
