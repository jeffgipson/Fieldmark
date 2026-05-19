import { test, expect } from "./fixtures/auth.js";

test.describe("Authentication", () => {
  test("redirects unauthenticated users away from dashboard", async ({ page }) => {
    await page.goto("/dashboard");

    await expect(page).toHaveURL(/\/login$/);
  });

  test("logs in with the demo account", async ({ authenticatedPage: page }) => {
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole("link", { name: "Scenarios" })).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 1, name: /Good morning,|What is on your mind this season\?/ })
    ).toBeVisible();
  });

  test("shows an error for invalid credentials", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("not-a-real-user@fieldmark.app");
    await page.getByLabel("Password").fill("wrong-password");
    await page.getByRole("button", { name: "Sign in", exact: true }).click();

    await expect(page.getByText(/invalid|incorrect|failed/i)).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });
});
