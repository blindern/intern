import { Temporal } from "@js-temporal/polyfill"
import ICAL from "ical.js"
import pMap from "p-map"
import type { FbsEvent, Frequency, Priority } from "../event.ts"

export async function getConfluenceEvents(): Promise<FbsEvent[]> {
  const result = await pMap(
    [
      // Prioriterte hendelser
      {
        priority: "high",
        url: "https://foreningenbs.no/confluence/rest/calendar-services/1.0/calendar/export/subcalendar/private/e5a4f5a3d6e9f59c56ed11357aeac75cc0e7797b.ics",
      },
      // Praktisk info
      {
        priority: "medium",
        url: "https://foreningenbs.no/confluence/rest/calendar-services/1.0/calendar/export/subcalendar/private/beec89491d0657c568d32b7e5006aa155d7fef20.ics",
      },
      // Ukesaktiviteter o.l.
      {
        priority: "low",
        url: "https://foreningenbs.no/confluence/rest/calendar-services/1.0/calendar/export/subcalendar/private/4f9b8510644e16ccf56a11517c1e5575cd495946.ics",
      },
    ] as const,
    async ({ priority, url }) => {
      const start = performance.now()
      console.log("Fetching", url)
      const response = await fetch(url)
      console.log(`Fetched ${url} in ${String(performance.now() - start)}ms`)
      if (!response.ok) {
        throw new Error(
          `Fetching ${url} failed with status ${String(response.status)}`,
        )
      }

      const result = parseIcsData(await response.text(), priority)
      console.log(`Found ${String(result.length)} events in ${url}`)
      return result
    },
  )

  return result.flat()
}

export function parseIcsData(icsData: string, priority: Priority): FbsEvent[] {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const jcalData = ICAL.parse(icsData)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const comp = new ICAL.Component(jcalData)
  const vevents = comp.getAllSubcomponents("vevent")

  const list: FbsEvent[] = []

  function* recurIterator(event: ICAL.Event): IterableIterator<ICAL.Time> {
    const iter = event.iterator()
    for (
      let next = iter.next() as ICAL.Time | undefined;
      next;
      next = iter.next()
    ) {
      if (next.compare(event.startDate) === 0) continue
      yield next
    }
  }

  for (const vevent of vevents) {
    const event = new ICAL.Event(vevent)

    const start = Temporal.Instant.fromEpochMilliseconds(
      event.startDate.toJSDate().getTime(),
    ).toZonedDateTimeISO("Europe/Oslo")
    const end = Temporal.Instant.fromEpochMilliseconds(
      event.endDate.toJSDate().getTime(),
    ).toZonedDateTimeISO("Europe/Oslo")

    const isStartStartOfDay = start.equals(start.startOfDay())
    const isEndStartOfDay = end.equals(end.startOfDay())

    const allday = isStartStartOfDay && isEndStartOfDay

    const duration = allday
      ? start.until(end, {
          smallestUnit: "day",
        })
      : start.until(end)

    const newEvent: FbsEvent = {
      type: "event",
      title: (event.summary || "").trim(),
      place: (event.location || "").trim() || undefined,
      priority,
      start: start.toInstant(),
      end: end.toInstant(),
      allday,
    }

    const rrule = vevent.getFirstPropertyValue("rrule") as
      | ICAL.Recur
      | undefined
    if (rrule) {
      const otherOccurrences = Array.from(recurIterator(event)).map((it) => {
        const start = Temporal.Instant.fromEpochMilliseconds(
          it.toJSDate().getTime(),
        ).toZonedDateTimeISO("Europe/Oslo")
        const end = start.add(duration)

        return {
          start: start.toInstant(),
          end: end.toInstant(),
        }
      })

      newEvent.recur = {
        frequency: rrule.freq as Frequency,
        interval: rrule.interval,
        events: otherOccurrences,
      }
    }

    list.push(newEvent)
  }

  return list
}
