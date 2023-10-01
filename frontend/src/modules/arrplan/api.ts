import { useApiService } from "modules/core/api/ApiServiceProvider.js"
import { Moment } from "moment"
import { useQuery } from "@tanstack/react-query"
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
  const api = useApiService()
  return useQuery(["arrplan", "list"], async () => {
    const response = await api.get("arrplan?invalidate=1")
    return (await response.json()) as EventItem[]
  })
}

export function useArrplanNext() {
  const api = useApiService()
  return useQuery(["arrplan", "next"], async () => {
    const response = await api.get("arrplan/next?count=6")
    return (await response.json()) as EventItem[]
  })
}
