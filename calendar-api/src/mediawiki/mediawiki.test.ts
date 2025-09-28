import { expect, test } from "vitest"
import { getMediawikiEvents } from "./mediawiki.ts"

test("mediawiki events", async () => {
  expect(await getMediawikiEvents()).toMatchSnapshot()
})
