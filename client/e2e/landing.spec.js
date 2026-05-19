import { test, expect } from "@playwright/test";

test.describe("Landing page", () => {
  test("shows brand tagline and sign-in entry points", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Know your margins before March." })).toBeVisible();
    await expect(page.getByRole("link", { name: "Sign in" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Start free — 30 days" })).toBeVisible();
  });

  test("navigates to login from header", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Sign in" }).first().click();

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  });
});
