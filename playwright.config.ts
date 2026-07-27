import { defineConfig, devices } from '@playwright/test';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'test@example.com';
const IS_CI = !!process.env.CI;
const USE_PRODUCTION_SERVER = IS_CI || process.env.PLAYWRIGHT_USE_PRODUCTION_SERVER === 'true';
const SERVER_COMMAND = USE_PRODUCTION_SERVER ? 'start' : 'dev';

const commonServerEnv = {
  E2E_TESTING: 'true',
  ADMIN_EMAIL,
  AUTH_SECRET: process.env.AUTH_SECRET || 'dummy_secret_for_local_development',
  AUTH_GITHUB_ID: process.env.AUTH_GITHUB_ID || 'dummy',
  AUTH_GITHUB_SECRET: process.env.AUTH_GITHUB_SECRET || 'dummy',
  AUTH_TRUST_HOST: 'true',
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: process.env.DB_PORT || '5432',
  DB_USERNAME: process.env.DB_USERNAME || 'postgres',
  DB_PASSWORD: process.env.DB_PASSWORD || 'password',
  DB_DATABASE: process.env.DB_DATABASE || 'ibacastgallery',
  DB_SCHEMA: process.env.DB_SCHEMA || 'public',
};

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: IS_CI,
  retries: IS_CI ? 2 : 0,
  workers: IS_CI || process.env.E2E_SERIAL === 'true' ? 1 : undefined,
  reporter: 'html',
  globalSetup: require.resolve('./e2e/global-setup.ts'),
  expect: {
    timeout: 30_000,
  },
  use: {
    trace: process.env.CI ? 'on-first-retry' : 'on',
    permissions: ['clipboard-read', 'clipboard-write'],
  },

  timeout: 1 * 60 * 1000, // 1m

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: [
    {
      command: `node .yarn/releases/yarn-4.9.0.cjs workspace tweet-tagger ${SERVER_COMMAND}`,
      url: 'http://127.0.0.1:3001/api/auth/session',
      reuseExistingServer: !IS_CI,
      timeout: 300000,
      env: {
        ...commonServerEnv,
        AUTH_URL: 'http://localhost:3001',
      },
    },
    {
      command: `node .yarn/releases/yarn-4.9.0.cjs workspace iba-cast-gallery ${SERVER_COMMAND}`,
      url: 'http://127.0.0.1:3000/api/casts',
      reuseExistingServer: !IS_CI,
      timeout: 300000,
      env: {
        ...commonServerEnv,
        AUTH_URL: 'http://localhost:3000',
      },
    },
  ],
});
