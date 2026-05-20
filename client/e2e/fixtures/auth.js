import { test as base, expect } from "@playwright/test";

export const DEMO_EMAIL = "demo@fieldmark.app";

/** Prefer UI/API demo login; password only for manual E2E if needed (see api DEMO_PASSWORD). */
export const DEMO_PASSWORD = process.env.DEMO_PASSWORD || "FieldmarkDemo2026!";

export const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    await page.goto("/login");
    await page.getByRole("button", { name: /Try demo/i }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
    await use(page);
  }
});

export { expect };
