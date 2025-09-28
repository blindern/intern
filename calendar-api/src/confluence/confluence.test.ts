import { readFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { expect, test } from "vitest"
import { parseIcsData } from "./confluence.ts"
import { Temporal } from "@js-temporal/polyfill"

test("confluence events", { timeout: 15_000 }, async () => {
  for (const { priority, file } of [
    {
      priority: "high",
      file: "testfiles/high.ics",
    },
    {
      priority: "medium",
      file: "testfiles/medium.ics",
    },
    {
      priority: "low",
      file: "testfiles/low.ics",
    },
  ] as const) {
    const icsData = await readFile(
      path.join(path.dirname(fileURLToPath(import.meta.url)), file),
      "utf8",
    )
    const result = parseIcsData(icsData, priority)
    const sorted = result
      .flat()
      .sort((a, b) => Temporal.ZonedDateTime.compare(a.start, b.start))
    expect(sorted).toMatchSnapshot(file)
  }
})
