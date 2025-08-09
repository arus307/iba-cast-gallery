import { defineConfig, devices } from '@playwright/test';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'test@example.com';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: [
    {
      command: 'yarn workspace tweet-tagger dev',
      url: 'http://localhost:3001',
      reuseExistingServer: !process.env.CI,
      timeout: 300000, // 5 minutes
      env: {
        E2E_TESTING: "true",
        ADMIN_EMAIL: ADMIN_EMAIL,
        AUTH_SECRET: "dummy_secret_for_local_development",
        DB_HOST: "localhost",
        DB_PORT: "5432",
        DB_USERNAME: "postgres",
        DB_PASSWORD: "password",
        DB_DATABASE: "ibacastgallery",
        AUTH_GITHUB_ID: "dummy",
        AUTH_GITHUB_SECRET: "dummy",
      }
    },
    {
      command: 'yarn workspace iba-cast-gallery dev',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
      timeout: 300000, // 5 minutes
      env: {
        DB_HOST: "localhost",
        DB_PORT: "5432",
        DB_USERNAME: "postgres",
        DB_PASSWORD: "password",
        DB_DATABASE: "ibacastgallery",
        AUTH_GITHUB_ID: "dummy",
        AUTH_GITHUB_SECRET: "dummy",
        AUTH_SECRET: "dummy_secret_for_local_development",
      }
    },
  ],
});
