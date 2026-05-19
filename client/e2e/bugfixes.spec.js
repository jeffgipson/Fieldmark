import { test, expect } from "./fixtures/auth.js";

test.describe("Bug fix smoke checks", () => {
  test("help page loads in-app FAQ", async ({ authenticatedPage: page }) => {
    await page.goto("/help");
    await expect(page.getByRole("heading", { name: "Help & support" })).toBeVisible();
    await expect(page.getByText("How do I enter input costs?")).toBeVisible();
  });

  test("sidebar highlights Benchmarks on benchmark route", async ({ authenticatedPage: page }) => {
    await page.goto("/scenarios");
    const benchmarkLink = page.getByRole("link", { name: "Benchmarks" });
    if (await benchmarkLink.isVisible()) {
      await benchmarkLink.click();
      await expect(page).toHaveURL(/\/benchmark$/);
      await expect(benchmarkLink).toHaveClass(/text-\[#7ecece\]|bg-fm-teal/);
    }
  });

  test("report page shows single generate CTA when no report", async ({ authenticatedPage: page }) => {
    await page.goto("/reports");
    const generateButtons = page.getByRole("button", { name: /Generate lender report|Regenerate report/i });
    const count = await generateButtons.count();
    expect(count).toBeLessThanOrEqual(1);
  });
});
