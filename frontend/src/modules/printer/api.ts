import { get } from 'api'
import { useQuery } from 'react-query'

export interface LastPrintItem {
  jobdate: string
  jobsize: number
  printername: string
  realname: string | null
  username: string
}

export function usePrinterLastList() {
  return useQuery(['printer', 'last'], async () => {
    const response = await get('printer/last')
    return (await response.json()) as LastPrintItem[]
  })
}
