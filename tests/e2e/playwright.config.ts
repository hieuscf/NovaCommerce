import { defineConfig, devices } from '@playwright/test';

const webUrl = process.env.WEB_BASE_URL ?? 'http://localhost:3001';
const adminUrl = process.env.ADMIN_BASE_URL ?? 'http://localhost:3002';

export default defineConfig({
  testDir: './smoke',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  use: {
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'web',
      use: { ...devices['Desktop Chrome'], baseURL: webUrl },
      testMatch: /web-.*\.spec\.ts/,
    },
    {
      name: 'admin',
      use: { ...devices['Desktop Chrome'], baseURL: adminUrl },
      testMatch: /admin-.*\.spec\.ts/,
    },
  ],
  webServer: [
    {
      command: 'pnpm --filter @novacommerce/web run dev',
      url: webUrl,
      reuseExistingServer: !process.env.CI,
      cwd: '../..',
    },
    {
      command: 'pnpm --filter @novacommerce/admin run dev',
      url: adminUrl,
      reuseExistingServer: !process.env.CI,
      cwd: '../..',
    },
  ],
});
