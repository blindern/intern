import type { Temporal } from "@js-temporal/polyfill"

export type Priority = "low" | "medium" | "high"
export type Frequency = "DAILY" | "WEEKLY" | "MONTHLY"

export interface FbsEvent {
  type: "event"
  start: Temporal.Instant
  end: Temporal.Instant
  title: string
  place?: string | undefined
  priority: Priority
  recur?:
    | {
        frequency: Frequency
        interval: number
        events: {
          start: Temporal.Instant
          end: Temporal.Instant
        }[]
      }
    | undefined

  // Old mediawiki fields.
  info?: string | undefined
  by?: string | undefined
}

export interface FbsComment {
  type: "comment"
  date: Temporal.PlainDate
  comment: string
}

export type FbsEventOrComment = FbsEvent | FbsComment

export function getIsFullDays(event: FbsEvent) {
  const start = event.start.toZonedDateTimeISO("Europe/Oslo")
  const end = event.end.toZonedDateTimeISO("Europe/Oslo")

  const isStartStartOfDay = start.equals(start.startOfDay())
  const isEndStartOfDay = end.equals(end.startOfDay())

  return isStartStartOfDay && isEndStartOfDay
}
