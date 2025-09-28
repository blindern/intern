import { expect, test } from "vitest"
import { getMediawikiEvents } from "./mediawiki.ts"
import { sortEventsByTimeAndTitle } from "../event-mapper.ts"

test("mediawiki events", async () => {
  expect(
    (await getMediawikiEvents()).sort(sortEventsByTimeAndTitle),
  ).toMatchSnapshot()
})
