import { Temporal } from "@js-temporal/polyfill"
import ICAL from "ical.js"
import { randomUUID } from "node:crypto"
import { sortEventsByTimeAndTitle } from "./event-mapper.ts"
import type { FbsEventOrComment } from "./event.ts"

function defaultUidGenerator() {
  return randomUUID().replace(/-/g, "").slice(0, 12)
}

export function createIcs(
  events: FbsEventOrComment[],
  options?: {
    // These are used for testing.
    uidGenerator?: () => string
    now?: Temporal.Instant
  },
) {
  const vcal = new ICAL.Component("vcalendar")

  const uidGenerator = options?.uidGenerator ?? defaultUidGenerator
  const now = options?.now ?? Temporal.Now.instant()

  vcal.addPropertyWithValue("version", "2.0")
  vcal.addPropertyWithValue("prodid", "foreningenbs.no")
  vcal.addPropertyWithValue("name", "foreningenbs.no")
  vcal.addPropertyWithValue("description", "Blindern Studenterhjem")

  events = events.sort(sortEventsByTimeAndTitle)

  for (const event of events) {
    if (event.type !== "event") {
      continue
    }

    const all = [
      { start: event.start, end: event.end },
      ...(event.recur?.events ?? []),
    ]

    for (const { start, end } of all) {
      const vevent = new ICAL.Component("vevent")

      vevent.addPropertyWithValue("uid", uidGenerator())
      vevent.addPropertyWithValue("dtstamp", now.round("second").toString())

      if (event.allday) {
        vevent.addPropertyWithValue(
          "dtstart",
          ICAL.Time.fromDateString(
            start.toZonedDateTimeISO("Europe/Oslo").toPlainDate().toString(),
          ),
        )
        vevent.addPropertyWithValue(
          "dtend",
          ICAL.Time.fromDateString(
            end.toZonedDateTimeISO("Europe/Oslo").toPlainDate().toString(),
          ),
        )
      } else {
        vevent.addPropertyWithValue("dtstart", start.toString())
        vevent.addPropertyWithValue("dtend", end.toString())
      }

      if (event.allday) {
        vevent.addPropertyWithValue("x-microsoft-cdo-alldayevent", "true")
      }

      vevent.addPropertyWithValue("summary", event.title)

      let description = ""
      if (event.by) {
        description += `[${event.by}]`
      }
      if (event.info) {
        if (event.by) {
          description += "\n"
        }
        description += event.info
      }
      if (description !== "") {
        vevent.addPropertyWithValue("description", description)
      }

      if (event.place) {
        vevent.addPropertyWithValue("location", event.place)
      }

      vcal.addSubcomponent(vevent)
    }
  }

  return vcal.toString()
}
