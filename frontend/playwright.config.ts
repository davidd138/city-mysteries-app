import { defineConfig } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// Load .env.test if it exists
const envTestPath = path.join(__dirname, '.env.test');
if (fs.existsSync(envTestPath)) {
  const envContent = fs.readFileSync(envTestPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const match = line.match(/^(\w+)=(.*)$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].trim();
    }
  }
}

export default defineConfig({
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  projects: [
    {
      name: 'local',
      testDir: './e2e',
      use: {
        baseURL: 'http://localhost:3000',
        browserName: 'chromium',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
      },
    },
    {
      name: 'live',
      testDir: './e2e-live',
      use: {
        baseURL: process.env.E2E_BASE_URL || 'https://d16xm6j7hdyytg.cloudfront.net',
        browserName: 'chromium',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        actionTimeout: 15000,
        navigationTimeout: 30000,
      },
    },
  ],
  webServer: {
    command: 'npx serve out -l 3000',
    port: 3000,
    reuseExistingServer: true,
    // Only start for local project
    timeout: 10000,
  },
});
