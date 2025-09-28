export interface NormalEvent {
  by?: string | undefined
  duration: string
  end: string // YYYY-MM-DD [HH:mm:ss]
  expired: boolean
  info?: string | undefined
  place?: string | undefined
  priority: "high" | "medium" | "low"
  recur?:
    | {
        interval: number
      }
    | undefined
  start: string // YYYY-MM-DD [HH:mm:ss]
  title: string
  type: "event"
}

export interface Comment {
  comment: string
  date: string // YYYY-MM-DD
  type: "comment"
}

export type EventItem = NormalEvent | Comment
