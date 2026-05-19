import { defineConfig, devices } from "@playwright/test";

const clientPort = 5173;
const apiPort = 3000;
const isCI = Boolean(process.env.CI);

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  reporter: isCI ? "github" : "list",
  timeout: 30_000,
  expect: {
    timeout: 10_000
  },
  use: {
    baseURL: `http://127.0.0.1:${clientPort}`,
    trace: "on-first-retry",
    screenshot: "only-on-failure"
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    }
  ],
  webServer: [
    {
      command: `cd ../api && bin/rails db:prepare demo:seed && bin/rails server -p ${apiPort} -e development`,
      url: `http://127.0.0.1:${apiPort}/api/health`,
      reuseExistingServer: !isCI,
      timeout: 120_000,
      stdout: "pipe",
      stderr: "pipe"
    },
    {
      command: "npm run dev -- --host 127.0.0.1 --port 5173 --strictPort",
      url: `http://127.0.0.1:${clientPort}`,
      reuseExistingServer: !isCI,
      timeout: 60_000,
      stdout: "pipe",
      stderr: "pipe"
    }
  ]
});
