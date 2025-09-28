import { readFile } from "fs/promises"
import * as path from "path"
import { fileURLToPath } from "url"
import type { FbsEventOrComment } from "../event.ts"
import { Temporal } from "@js-temporal/polyfill"

// Before Confluence, we stored events in a MediaWiki instance.
// This covers the old data from that instance.

let cache: FbsEventOrComment[] | undefined

export async function getMediawikiEvents(): Promise<FbsEventOrComment[]> {
  if (!cache) {
    // Read the JSON file from the same directory
    const jsonPath = path.join(
      path.dirname(fileURLToPath(import.meta.url)),
      "mediawiki.json",
    )
    const rawData = await readFile(jsonPath, "utf8")
    cache = JSON.parse(rawData, (key, value) => {
      if (["start", "end"].includes(key)) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        return Temporal.ZonedDateTime.from(value)
      }
      if (key === "date") {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        return Temporal.PlainDate.from(value)
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return value
    }) as FbsEventOrComment[]
  }
  return cache
}
