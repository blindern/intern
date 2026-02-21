import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: "e2e",
  timeout: 120_000,
  expect: { timeout: 10_000 },
  retries: 3,
  reporter: process.env.CI ? [["list"], ["github"], ["html"]] : [["list"], ["html"]],
  use: {
    baseURL: process.env.BASE_URL ?? "https://foreningenbs.no",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        locale: "nb-NO",
        viewport: { width: 1280, height: 720 },
        video: "retain-on-failure",
        trace: "retain-on-failure",
      },
    },
  ],
})
