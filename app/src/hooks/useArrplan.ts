import { useQuery } from "@tanstack/react-query"
import { moment } from "../utils/dates.js"

export interface NormalEvent {
  by?: string
  duration: string
  end: string
  expired: boolean
  info?: string
  place?: string
  priority: "high" | "medium" | "low"
  recur?: boolean
  start: string
  title: string
  type: "event"
}

export interface Comment {
  comment: string
  date: string
  type: "comment"
}

export type EventItem = NormalEvent | Comment

export interface Semester {
  id: string
  year: number
  semester: "v" | "h"
}

export function getSemesterFromDate(date: moment.Moment): Semester {
  const prefix = date.month() >= 6 ? "h" : "v"
  return {
    id: prefix + String(date.year()).slice(2, 4),
    year: date.year(),
    semester: prefix,
  }
}

export function getSemesterListFromEvent(event: EventItem): Semester[] {
  if (event.type === "comment") {
    return [getSemesterFromDate(moment(event.date))]
  }
  const start = getSemesterFromDate(moment(event.start))
  const end = getSemesterFromDate(moment(event.end))
  return start.id === end.id ? [start] : [start, end]
}

export function useArrplanList() {
  return useQuery({
    queryKey: ["arrplan", "list"],
    queryFn: async () => {
      const response = await fetch(
        "https://foreningenbs.no/calendar-api/events",
      )
      if (!response.ok) throw new Error("Failed to fetch arrplan")
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
      if (!response.ok) throw new Error("Failed to fetch arrplan")
      return (await response.json()) as EventItem[]
    },
  })
}
