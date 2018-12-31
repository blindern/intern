import { get } from 'api'

export interface LastPrintItem {
  jobdate: string
  jobsize: number
  printername: string
  realname: string | null
  username: string
}

class PrinterService {
  async getLastList() {
    const response = await get('printer/last')
    return (await response.json()) as LastPrintItem[]
  }
}

export const printerService = new PrinterService()
