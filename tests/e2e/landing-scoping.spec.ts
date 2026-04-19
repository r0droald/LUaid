import { test, expect } from "@playwright/test";

// Ad-hoc verification tests for Task 11 of the landing visual redesign.
// These assert that landing-only fonts stay off /demo/* routes and that the
// landing layout behaves correctly at mobile viewports.

test("demo route does not request Google Fonts", async ({ page }) => {
  const fontRequests: string[] = [];
  page.on("request", (request) => {
    const url = request.url();
    if (url.includes("fonts.googleapis.com") || url.includes("fonts.gstatic.com")) {
      fontRequests.push(url);
    }
  });

  await page.goto("/demo/en", { waitUntil: "networkidle" });

  expect(fontRequests, `Google Fonts leaked to /demo/en: ${fontRequests.join(", ")}`).toHaveLength(0);
});

test("landing page does request Google Fonts (sanity check)", async ({ page }) => {
  const fontRequests: string[] = [];
  page.on("request", (request) => {
    const url = request.url();
    if (url.includes("fonts.googleapis.com") || url.includes("fonts.gstatic.com")) {
      fontRequests.push(url);
    }
  });

  await page.goto("/", { waitUntil: "networkidle" });

  expect(fontRequests.length, "Landing page should load Public Sans / Instrument Serif from Google Fonts").toBeGreaterThan(0);
});

test("landing page renders on mobile viewport without horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto("/");

  await expect(
    page.getByRole("heading", { level: 1, name: /built on the ground/i }),
  ).toBeVisible();

  const hasHorizontalOverflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });
  expect(hasHorizontalOverflow, "Landing page should not overflow horizontally at 375px").toBe(false);

  await page.screenshot({
    path: "tests/e2e/screenshots/landing-mobile.png",
    fullPage: true,
  });
});

test("landing anchor links resolve to real sections", async ({ page }) => {
  await page.goto("/");

  for (const id of ["story", "what-it-does", "get-involved"]) {
    const target = page.locator(`#${id}`);
    await expect(target, `#${id} section should exist`).toHaveCount(1);
  }
});
