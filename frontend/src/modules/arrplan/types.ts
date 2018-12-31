export interface NormalEvent {
  allday: boolean
  by: string | null
  duration: string
  end: string // YYYY-MM-DD
  expired: boolean
  info: string | null
  place: string | null
  priority: 'high' | 'medium' | 'low'
  start: string // YYYY-MM-DD
  title: string
  type: 'event' | 'event_recurring'
}

export interface Comment {
  comment: string
  date: string // YYYY-MM-DD
  type: 'comment'
}

export type EventItem = NormalEvent | Comment
