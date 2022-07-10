import { get } from 'api'
import { useQuery } from 'react-query'

export interface DugnadDay {
  checked: '0' | '1'
  date: string // YYYY-MM-DD 00:00:00
  deleted: '0' | '1'
  id: string
  people: DugnadPerson[]
  type: string
}

export interface DugnadPerson {
  done: '0' | '1'
  name: string
  room: string
  type: string
}

export function useDugnadenList() {
  return useQuery(['dugnaden', 'old', 'list'], async () => {
    const response = await get('dugnaden/old')
    return (await response.json()) as DugnadDay[]
  })
}
