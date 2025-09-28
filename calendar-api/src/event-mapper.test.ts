import { Temporal } from "@js-temporal/polyfill"
import { describe, expect, test } from "vitest"
import { getDuration } from "./event-mapper.ts"

describe("getDuration", () => {
  test("a single day", () => {
    const result = getDuration({
      start: Temporal.Instant.from("2025-01-01T23:00:00Z"),
      end: Temporal.Instant.from("2025-01-02T23:00:00Z"),
      recur: undefined,
    })
    expect(result).toMatchInlineSnapshot(`"torsdag 2. januar"`)
  })

  test("a single day another date", () => {
    const result = getDuration({
      start: Temporal.Instant.from("2025-06-05T22:00:00Z"),
      end: Temporal.Instant.from("2025-06-06T22:00:00Z"),
      recur: undefined,
    })
    expect(result).toMatchInlineSnapshot(`"fredag 6. juni"`)
  })

  test("multiple days", () => {
    const result = getDuration({
      start: Temporal.Instant.from("2025-06-05T22:00:00Z"),
      end: Temporal.Instant.from("2025-06-07T22:00:00Z"),
      recur: undefined,
    })
    expect(result).toMatchInlineSnapshot(`"fre. 6.–lør. 7. juni"`)
  })

  test("time span on same day", () => {
    const result = getDuration({
      start: Temporal.Instant.from("2025-06-05T10:00:00Z"),
      end: Temporal.Instant.from("2025-06-05T14:00:00Z"),
      recur: undefined,
    })
    expect(result).toMatchInlineSnapshot(`"torsdag 5. juni kl. 12:00"`)
  })

  test("time span over multiple days", () => {
    const result = getDuration({
      start: Temporal.Instant.from("2025-06-05T14:00:00Z"),
      end: Temporal.Instant.from("2025-06-07T12:00:00Z"),
      recur: undefined,
    })
    expect(result).toMatchInlineSnapshot(`"tor. 5., 16:00–lør. 7. juni, 14:00"`)
  })

  test("time span over multiple days different months", () => {
    const result = getDuration({
      start: Temporal.Instant.from("2025-07-28T14:00:00Z"),
      end: Temporal.Instant.from("2025-08-07T12:00:00Z"),
      recur: undefined,
    })
    expect(result).toMatchInlineSnapshot(
      `"man. 28. juli, 16:00–tor. 7. aug., 14:00"`,
    )
  })

  test("recurring whole day", () => {
    const result = getDuration({
      start: Temporal.Instant.from("2025-06-05T22:00:00Z"),
      end: Temporal.Instant.from("2025-06-06T22:00:00Z"),
      recur: {
        events: [],
        frequency: "DAILY",
        interval: 1,
      },
    })
    expect(result).toMatchInlineSnapshot(`"hver fredag"`)
  })

  test("recurring at time span", () => {
    const result = getDuration({
      start: Temporal.Instant.from("2025-06-05T14:00:00Z"),
      end: Temporal.Instant.from("2025-06-05T16:00:00Z"),
      recur: {
        events: [],
        frequency: "DAILY",
        interval: 1,
      },
    })
    expect(result).toMatchInlineSnapshot(`"hver torsdag kl. 16:00"`)
  })
})
