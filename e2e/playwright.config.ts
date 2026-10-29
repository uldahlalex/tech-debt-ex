import { defineConfig, devices } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";

/*
 * These tests are the SAFETY NET for the refactoring exercise.
 * They start the real API and the real frontend and only talk to them
 * through HTTP and the browser, so they don't care how the code is organised.
 *
 * DO NOT CHANGE THIS FILE OR THE TESTS while refactoring.
 */

export const API_URL = "http://localhost:5150";
export const FRONTEND_URL = "http://localhost:3150";

const repoRoot = path.resolve(import.meta.dirname, "..");

// Every test run gets a brand new, empty database so results are repeatable.
// (Playwright loads this file in several processes; only the main one starts the servers.)
const tmpDir = path.join(import.meta.dirname, ".tmp");
fs.mkdirSync(tmpDir, { recursive: true });
const databaseFile = path.join(tmpDir, `e2e-${process.pid}.db`);

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"], ["html", { open: "never" }]],
  timeout: 30_000,
  use: {
    trace: "retain-on-failure",
  },
  projects: [
    { name: "api", testMatch: /api\/.*\.spec\.ts/ },
    {
      name: "ui",
      testMatch: /ui\/.*\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], baseURL: FRONTEND_URL },
    },
  ],
  webServer: [
    {
      name: "API",
      command: "dotnet run --project server/API/API.csproj --no-launch-profile --urls " + API_URL,
      cwd: repoRoot,
      url: `${API_URL}/GetChefs`,
      env: {
        ASPNETCORE_ENVIRONMENT: "Development",
        ConnectionStrings__Cookbook: `Data Source=${databaseFile}`,
      },
      reuseExistingServer: false,
      timeout: 180_000,
      stdout: "ignore",
      stderr: "pipe",
    },
    {
      name: "Frontend",
      command: "bun src/index.ts",
      cwd: path.join(repoRoot, "client"),
      url: FRONTEND_URL,
      env: { PORT: "3150" },
      reuseExistingServer: false,
      timeout: 60_000,
    },
  ],
});
