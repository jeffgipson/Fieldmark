import { test as base, expect } from "@playwright/test";

export const DEMO_EMAIL = "demo@fieldmark.app";
export const DEMO_PASSWORD = "password123";

export const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Use demo account" }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
    await use(page);
  }
});

export { expect };
