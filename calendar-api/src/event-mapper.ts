import { Temporal } from "@js-temporal/polyfill"
import type { FbsEvent, FbsEventOrComment } from "./event.ts"

export function getAllEvents(events: FbsEventOrComment[]) {
  return events
    .sort(sortEventsByTimeAndTitle)
    .map(toResponseModel(Temporal.Now.instant()))
}

export function getNextEvents(events: FbsEventOrComment[], count: number) {
  const now = Temporal.Now.instant()
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
      if (Temporal.Instant.compare(now, end) < 0) {
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

export function sortEventsByTimeAndTitle(
  a: FbsEventOrComment,
  b: FbsEventOrComment,
): number {
  const result = Temporal.Instant.compare(getStart(a), getStart(b))
  if (result === 0) {
    const aText = a.type === "event" ? a.title : a.comment
    const bText = b.type === "event" ? b.title : b.comment
    return aText.localeCompare(bText)
  }
  return result
}

function getStart(value: FbsEventOrComment): Temporal.Instant {
  if (value.type === "event") {
    return value.start
  }
  return value.date.toZonedDateTime("Europe/Oslo").toInstant()
}

function toResponseModel(now: Temporal.Instant) {
  return (event: FbsEventOrComment) => {
    switch (event.type) {
      case "comment":
        return {
          ...event,
          date: event.date
            .toZonedDateTime("Europe/Oslo")
            .toPlainDate()
            .toString(),
        }
      case "event": {
        return {
          ...event,
          ...getStartAndEndText(event),
          expired: Temporal.Instant.compare(now, event.end) >= 0,
          duration: getDuration(event),
        }
      }
    }
  }
}

const midnight = new Temporal.PlainTime()

export function getDuration(
  event: Pick<FbsEvent, "start" | "end" | "allday" | "recur">,
): string {
  const start = event.start.toZonedDateTimeISO("Europe/Oslo")

  if (event.recur) {
    if (start.toPlainTime().equals(midnight)) {
      return (
        "hver " +
        event.start.toLocaleString("nb-NO", {
          weekday: "long",
        })
      )
    } else {
      return (
        "hver " +
        start.toLocaleString("nb-NO", {
          weekday: "long",
          hour: "2-digit",
          minute: "2-digit",
        })
      )
    }
  }

  let end = event.end.toZonedDateTimeISO("Europe/Oslo")

  const isStartMidnight = start.toPlainTime().equals(midnight)
  const isEndMidnight = end.toPlainTime().equals(midnight)

  if (isStartMidnight && isEndMidnight) {
    end = end.subtract({ days: 1 })
  }

  // Within or exactly a single day
  if (start.toPlainDate().equals(end.toPlainDate())) {
    if (isStartMidnight && isEndMidnight) {
      return start.toLocaleString("nb-NO", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    }

    return start.toLocaleString("nb-NO", {
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const sameMonth = start
    .toPlainDate()
    .toPlainYearMonth()
    .equals(end.toPlainDate().toPlainYearMonth())

  const startText = start.toLocaleString("nb-NO", {
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
  const start = event.start.toZonedDateTimeISO("Europe/Oslo")
  const end = event.end.toZonedDateTimeISO("Europe/Oslo")

  return {
    start: event.allday
      ? start.toPlainDate().toString()
      : formatLocalDate(start),
    end: event.allday
      ? end.toPlainDate().subtract({ days: 1 }).toString()
      : formatLocalDate(end),
  }
}
