import { Temporal } from "@js-temporal/polyfill"
import { readFile } from "fs/promises"
import * as path from "path"
import { fileURLToPath } from "url"
import type { FbsEvent, FbsEventOrComment, Priority } from "../event.ts"

interface MediaWikiApiResponse {
  query?: {
    pages?: Record<
      string,
      {
        revisions?: {
          "*": string
        }[]
      }
    >
  }
}

interface ParsedComment {
  type: "comment"
  date: string
  comment: string
}

interface ParsedEvent {
  type: "event"
  startDate: string
  startTime?: string | undefined
  endDate?: string | undefined
  endTime?: string | undefined
  title: string
  by?: string | undefined
  place?: string | undefined
  info?: string | undefined
  priority?: Priority | undefined
  repeat?:
    | {
        type: "count"
        frequency: "WEEKLY"
        count: number
      }
    | undefined
}

type Parsed = ParsedComment | ParsedEvent

function getTime(date: string, time?: string, addOneDay?: boolean) {
  return Temporal.PlainDateTime.from(date)
    .withPlainTime(time ? Temporal.PlainTime.from(time) : undefined)
    .add({ days: addOneDay ? 1 : 0 })
    .toZonedDateTime("Europe/Oslo")
}

export async function getMediawikiEvents(): Promise<FbsEventOrComment[]> {
  const parsed = await getParsedMediawiki()
  console.log(`Found ${String(parsed.length)} events in mediawiki`)
  return parsed.map<FbsEventOrComment>((item) => {
    if (item.type === "comment") {
      return {
        type: "comment",
        date: Temporal.PlainDate.from(item.date),
        comment: item.comment,
      }
    }

    const isFullDays = !item.startTime && !item.endTime

    const start = getTime(item.startDate, item.startTime)
    const end = getTime(
      item.endDate ?? item.startDate,
      item.endTime,
      !item.endTime,
    )

    const duration = isFullDays
      ? start.until(end, {
          smallestUnit: "day",
        })
      : start.until(end)

    let recur: FbsEvent["recur"] | undefined
    if (item.repeat) {
      let dcur = start
      const events: {
        start: Temporal.ZonedDateTime
        end: Temporal.ZonedDateTime
      }[] = []
      for (let i = 0; i < item.repeat.count - 1; i++) {
        dcur = dcur.add({ weeks: 1 }).withPlainTime(start.toPlainTime())
        const dend = dcur.add(duration)
        events.push({
          start: dcur,
          end: dend,
        })
      }
      recur = {
        frequency: item.repeat.frequency,
        interval: 1,
        events,
      }
    }

    return {
      type: "event",
      title: item.title,
      by: item.by,
      place: item.place,
      priority: item.priority ?? "medium",
      start,
      end,
      info: item.info,
      recur,
    }
  })
}

export async function getParsedMediawiki(): Promise<Parsed[]> {
  // Read the JSON file from the same directory
  const jsonPath = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    "mediawiki-arrplan.json",
  )
  const rawData = await readFile(jsonPath, "utf8")
  const data = JSON.parse(rawData) as MediaWikiApiResponse

  if (!data.query?.pages) {
    return []
  }

  const pages = data.query.pages
  const pageKey = Object.keys(pages)[0]
  if (!pageKey) {
    return []
  }
  const page = pages[pageKey]

  if (!page?.revisions?.[0]) {
    return []
  }

  const content = page.revisions[0]["*"]

  // Extract content from <pre> tags
  const preMatches = content.match(/<pre>(.+?)<\/pre>/gms)
  if (!preMatches) {
    return []
  }

  // Combine all <pre> content and split into lines
  const allPreContent = preMatches
    .map((match) => match.replace(/<\/?pre>/g, ""))
    .join("\n")
  const lines = allPreContent.split(/\r?\n/)
  const groups = splitIntoGroups(lines)
  const result: Parsed[] = []

  function fixDate(date: string): string {
    return date.replace(/-(\d)$/, "-0$1")
  }

  for (const [header, ...group] of groups) {
    const commentMatch = /^COMMENT (\d{4}-\d\d-\d\d)$/.exec(header)
    if (commentMatch) {
      const commentDate = commentMatch[1]

      result.push({
        type: "comment",
        date: commentDate?.trim() ?? "",
        comment: group.join("\n").trim(),
      })

      continue
    }

    // Must be an event.

    const toProcess = [...group]

    let by: string | undefined
    let priority: Priority | undefined
    let place: string | undefined
    let info: string | undefined
    let repeat: ParsedEvent["repeat"] | undefined

    // Try to match date pattern
    const dateMatch =
      /^(\d{4}-\d\d-\d?\d)( \d\d:\d\d)?(?:->(\d{4}-\d\d-\d\d)? ?(\d\d:\d\d)?)? ?(.*)$/.exec(
        header,
      )
    if (!dateMatch) {
      console.error("Unknown event", header, group)
      throw new Error("Unknown event")
    }

    // 1 => from date
    // 2 => from time
    // 3 => to date
    // 4 => to time
    // 5 => title with options

    const fromDate = fixDate(dateMatch[1]!)
    const fromTime = dateMatch[2]?.trim()
    const toDate = dateMatch[3]
    const toTime = dateMatch[4]?.trim()
    const titleWithOptions = dateMatch[5] ?? ""

    // Parse title with options if present
    let title
    if (titleWithOptions) {
      const titleMatch = /^(.+?)(\s+\((.+?)\))?(\s+(LOW|MEDIUM|HIGH))?$/.exec(
        titleWithOptions,
      )
      if (!titleMatch) {
        throw new Error("Invalid title")
      }

      title = titleMatch[1]!.trim()

      if (titleMatch[3]) {
        by = titleMatch[3].trim()
      }

      if (titleMatch[5]) {
        const priorityText = titleMatch[5].trim()
        switch (priorityText) {
          case "LOW":
            priority = "low"
            break
          case "HIGH":
            priority = "high"
            break
          default:
            priority = "medium"
        }
      }
    } else {
      if (toProcess.length === 0) {
        throw new Error("No title")
      }
      title = toProcess.shift()!.trim()
    }

    while (toProcess.length > 0) {
      const row = toProcess.shift()!
      if (row.trim() == "") {
        continue
      }

      if (row.startsWith("BY:")) {
        by = row.substring(3).trim()
        continue
      }

      if (/^PLACE:/i.test(row)) {
        place = row.substring(6).trim()
        continue
      }

      if (row.startsWith("PRI:")) {
        const priorityText = row.substring(4).trim()
        switch (priorityText) {
          case "LOW":
            priority = "low"
            break
          case "HIGH":
            priority = "high"
            break
          case "MEDIUM":
            priority = "medium"
            break
          default:
            throw new Error("Unknown priority: " + priorityText)
        }
        continue
      }

      if (row.startsWith("INFO:")) {
        info = row.substring(5).trim()
        while (toProcess[0]?.slice(0, 2) === "  ") {
          info += "\n" + toProcess.shift()!.trim()
        }
        continue
      }

      if (row.startsWith("REPEAT:")) {
        const text = row.substring(7).trim()
        const match = /^WEEKLY:(\d+)$/.exec(text)
        if (!match) {
          throw new Error("Invalid repeat: " + text)
        }

        repeat = {
          type: "count",
          frequency: "WEEKLY",
          count: parseInt(match[1]!),
        }

        continue
      }

      throw new Error("Unknown row: " + row)
    }

    result.push({
      type: "event",
      startDate: fromDate,
      startTime: fromTime,
      endDate: toDate,
      endTime: toTime,
      priority,
      title,
      by,
      place,
      info,
      repeat,
    })
  }

  return result
}

function splitIntoGroups(lines: string[]): [string, ...string[]][] {
  const groups: [string, ...string[]][] = []
  let currentGroup: string[] = []
  let blanks: string[] = []

  for (const row of lines) {
    // Skip empty lines and comments
    if (!row || row.startsWith("#") || (row.length > 2 && row[2] === "#")) {
      if (!row) {
        blanks.push("")
      }
      continue
    }

    if (!row.startsWith("  ")) {
      // New event
      if (currentGroup.length > 0) {
        groups.push(currentGroup as [string, ...string[]])
      }
      currentGroup = [row]
      blanks = []
    } else if (currentGroup.length === 0) {
      console.error("Unexpected continuation", row)
    } else {
      // Continuation
      currentGroup.push(...blanks)
      currentGroup.push(row.slice(2))
      blanks = []
    }
  }

  if (currentGroup.length > 0) {
    groups.push(currentGroup as [string, ...string[]])
  }

  return groups
}
