import { get } from 'api'
import { Moment } from 'moment'
import moment from 'utils/moment'
import { EventItem } from './types'

export interface Semester {
  id: string
  year: number
  semester: 'v' | 'h'
}

export const getSemesterListFromEvent = (event: EventItem) => {
  const getFromDate = (date: Moment): Semester => {
    const prefix = date.month() >= 6 ? 'h' : 'v'
    const suffix = String(date.year()).slice(2, 4)
    return {
      id: prefix + suffix,
      year: date.year(),
      semester: prefix,
    }
  }

  if (event.type === 'comment') {
    return [getFromDate(moment(event.date))]
  }

  const start = getFromDate(moment(event.start))
  const end = getFromDate(moment(event.end))

  return start.id === end.id ? [start] : [start, end]
}

class ArrplanService {
  async getList() {
    const response = await get('arrplan?invalidate=1')
    return (await response.json()) as EventItem[]
  }

  async getNext() {
    const response = await get('arrplan/next?count=6')
    return (await response.json()) as EventItem[]
  }
}

export const arrplanService = new ArrplanService()
