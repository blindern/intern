import type { Temporal } from "@js-temporal/polyfill"

export type Priority = "low" | "medium" | "high"
export type Frequency = "DAILY" | "WEEKLY" | "MONTHLY"

export interface FbsEvent {
  type: "event"
  start: Temporal.ZonedDateTime
  end: Temporal.ZonedDateTime
  title: string
  place?: string | undefined
  priority: Priority
  recur?:
    | {
        frequency: Frequency
        interval: number
        events: {
          start: Temporal.ZonedDateTime
          end: Temporal.ZonedDateTime
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
  const isStartStartOfDay = event.start.equals(event.start.startOfDay())
  const isEndStartOfDay = event.end.equals(event.end.startOfDay())

  return isStartStartOfDay && isEndStartOfDay
}
