import { Temporal } from "@js-temporal/polyfill"
import {
  getIsFullDays,
  sortEventsByTimeAndTitle,
  type FbsEvent,
  type FbsEventOrComment,
} from "./event.ts"

const cache = new WeakMap<object, unknown>()

export function getAllEvents(events: FbsEventOrComment[]) {
  const cached = cache.get(events)
  if (cached) {
    return cached
  }

  const result = events.map(
    toResponseModel(Temporal.Now.zonedDateTimeISO("Europe/Oslo")),
  )

  cache.set(events, result)
  return result
}

export function getNextEvents(events: FbsEventOrComment[], count: number) {
  const now = Temporal.Now.zonedDateTimeISO("Europe/Oslo")
  const expandedEvents: FbsEvent[] = []

  for (const event of events) {
    if (event.type !== "event") {
      continue
    }

    const all = [
      { start: event.start, end: event.end },
      ...(event.recur?.events ?? []),
    ]

    for (const { start, end } of all) {
      if (Temporal.ZonedDateTime.compare(now, end) < 0) {
        expandedEvents.push({
          ...event,
          recur: undefined,
          start,
          end,
        })
      }
    }
  }

  return expandedEvents
    .sort(sortEventsByTimeAndTitle)
    .slice(0, count)
    .map(toResponseModel(now))
}

export function toResponseModel(now: Temporal.ZonedDateTime) {
  return (event: FbsEventOrComment) => {
    switch (event.type) {
      case "comment":
        return {
          ...event,
          date: event.date.toString(),
        }
      case "event": {
        return {
          ...event,
          ...getStartAndEndText(event),
          expired: Temporal.ZonedDateTime.compare(now, event.end) >= 0,
          duration: getDuration(event),
          // Not exposing recur data for now.
          recur: event.recur ? true : undefined,
        }
      }
    }
  }
}

const midnight = new Temporal.PlainTime()

export function getDuration(
  event: Pick<FbsEvent, "start" | "end" | "recur">,
): string {
  if (event.recur) {
    if (event.start.toPlainTime().equals(midnight)) {
      return (
        "hver " +
        event.start.toLocaleString("nb-NO", {
          weekday: "long",
        })
      )
    } else {
      return (
        "hver " +
        event.start.toLocaleString("nb-NO", {
          weekday: "long",
          hour: "2-digit",
          minute: "2-digit",
        })
      )
    }
  }

  let end = event.end

  const isStartMidnight = event.start.toPlainTime().equals(midnight)
  const isEndMidnight = end.toPlainTime().equals(midnight)

  if (isStartMidnight && isEndMidnight) {
    end = end.subtract({ days: 1 })
  }

  // Within or exactly a single day
  if (event.start.toPlainDate().equals(end.toPlainDate())) {
    if (isStartMidnight && isEndMidnight) {
      return event.start.toLocaleString("nb-NO", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    }

    return event.start.toLocaleString("nb-NO", {
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const sameMonth = event.start
    .toPlainDate()
    .toPlainYearMonth()
    .equals(end.toPlainDate().toPlainYearMonth())

  const startText = event.start.toLocaleString("nb-NO", {
    weekday: "short",
    day: "numeric",
    month: sameMonth ? undefined : "short",
    hour: isStartMidnight ? undefined : "2-digit",
    minute: isStartMidnight ? undefined : "2-digit",
  })

  const endText = end.toLocaleString("nb-NO", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: isEndMidnight ? undefined : "2-digit",
    minute: isEndMidnight ? undefined : "2-digit",
  })

  return `${startText}–${endText}`
}

function formatLocalDate(date: Temporal.ZonedDateTime): string {
  return `${date.toPlainDate().toString()} ${date.toPlainTime().toString()}`
}

function getStartAndEndText(event: FbsEvent): { start: string; end: string } {
  const isFullDays = getIsFullDays(event)

  return {
    start: isFullDays
      ? event.start.toPlainDate().toString()
      : formatLocalDate(event.start),
    end: isFullDays
      ? event.end.toPlainDate().subtract({ days: 1 }).toString()
      : formatLocalDate(event.end),
  }
}
