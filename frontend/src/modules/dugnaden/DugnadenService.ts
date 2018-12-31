import { get } from "api";

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

class DugnadenService {
  async getList() {
    const response = await get('dugnaden/old')
    return (await response.json()) as DugnadDay[]
  }
}

export const dugnadenService = new DugnadenService()
