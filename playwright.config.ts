import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  testMatch: "claims.spec.ts",
  use: {
    baseURL: "http://127.0.0.1:4173",
    browserName: "chromium",
    headless: true,
  },
  webServer: {
    command: "npm run build && node tests/static-server.mjs",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: false,
  },
});
