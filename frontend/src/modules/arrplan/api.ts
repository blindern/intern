import { useQuery } from "@tanstack/react-query"
import { ResponseError } from "modules/core/api/errors.js"
import { Moment } from "moment"
import moment from "utils/moment.js"
import { EventItem } from "./types.js"

export interface Semester {
  id: string
  year: number
  semester: "v" | "h"
}

export const getSemesterListFromEvent = (event: EventItem) => {
  const getFromDate = (date: Moment): Semester => {
    const prefix = date.month() >= 6 ? "h" : "v"
    const suffix = String(date.year()).slice(2, 4)
    return {
      id: prefix + suffix,
      year: date.year(),
      semester: prefix,
    }
  }

  if (event.type === "comment") {
    return [getFromDate(moment(event.date))]
  }

  const start = getFromDate(moment(event.start))
  const end = getFromDate(moment(event.end))

  return start.id === end.id ? [start] : [start, end]
}

export function useArrplanList() {
  return useQuery({
    queryKey: ["arrplan", "list"],

    queryFn: async () => {
      const response = await fetch(
        "https://foreningenbs.no/calendar-api/events",
      )
      if (!response.ok) {
        let data
        try {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          data = await response.json()
        } catch {
          data = null
        }
        throw new ResponseError(response, [], data)
      }
      return (await response.json()) as EventItem[]
    },
  })
}

export function useArrplanNext() {
  return useQuery({
    queryKey: ["arrplan", "next"],

    queryFn: async () => {
      const response = await fetch(
        "https://foreningenbs.no/calendar-api/events/next?count=6",
      )
      if (!response.ok) {
        let data
        try {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          data = await response.json()
        } catch {
          data = null
        }
        throw new ResponseError(response, [], data)
      }
      return (await response.json()) as EventItem[]
    },
  })
}
