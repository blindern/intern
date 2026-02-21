import { expect, test } from "@playwright/test"

test("homepage loads with navigation", async ({ page }) => {
  await page.goto("/intern/")
  await expect(page.locator(".navbar-brand")).toHaveText("FBS")
  await expect(
    page.locator(".navbar a", { hasText: "Arrangementplan" }),
  ).toBeVisible()
  await expect(
    page.locator(".navbar a", { hasText: "Biblioteket" }),
  ).toBeVisible()
})

test("can login", async ({ page }) => {
  const username = process.env.FBS_TEST_USERNAME
  if (!username) throw new Error("Missing FBS_TEST_USERNAME")
  const password = process.env.FBS_TEST_PASSWORD
  if (!password) throw new Error("Missing FBS_TEST_PASSWORD")

  await page.goto("/intern/")
  await page.getByRole("link", { name: "Logg inn" }).click()

  await page
    .locator('button:text("Brukernavn og passord for foreningsbrukeren din")')
    .click()
  await page.locator("#username").fill(username)
  await page.locator("#password").fill(password)
  await page.locator("button[type=submit]").click()

  await expect(
    page.getByText(`Du er innlogget som ${username}`),
  ).toBeVisible()
})
