import { defineConfig, devices } from '@playwright/test';

// Expects the dev servers to be running already:
//   cd backend  && npm run dev   (port 4001)
//   cd frontend && npm run dev   (port 5173)
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: 1,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
