import { defineConfig, devices } from "@playwright/test";

// Fixed local server and mocked API: this suite must never target production.
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60000,
  workers: 1,
  use: { baseURL: "http://127.0.0.1:3107", trace: "retain-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: "npx next dev --webpack --hostname 127.0.0.1 --port 3107",
    url: "http://127.0.0.1:3107/system/medical-history/hc-test-patient",
    reuseExistingServer: false,
    timeout: 180000,
    env: { NEXT_PUBLIC_API_URL: "http://127.0.0.1:8000" },
  },
});
