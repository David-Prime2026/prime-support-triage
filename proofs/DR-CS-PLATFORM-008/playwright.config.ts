import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  testMatch: "skip-replay.pw.ts",
  timeout: 60_000,
  use: { ignoreHTTPSErrors: true },
});
