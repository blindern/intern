import { Temporal } from "@js-temporal/polyfill"
import { createIcs } from "./create-ics.ts"
import { getMediawikiEvents } from "./mediawiki/mediawiki.ts"
import { expect, test } from "vitest"

test("create ics", async () => {
  const events = await getMediawikiEvents()
  expect(
    createIcs(events, {
      now: Temporal.Instant.from("2025-09-27T22:54:54.214694192Z"),
      uidGenerator: () => "teststub",
    }),
  ).toMatchSnapshot()
})
