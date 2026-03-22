import { Page, expect } from '@playwright/test';

const TEST_EMAIL = process.env.E2E_TEST_EMAIL || 'test-e2e@citymysteries.com';
const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD || 'TestDetective123!';

export async function loginAsTestUser(page: Page) {
  await page.goto('/login/');
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });

  await page.fill('input[type="email"]', TEST_EMAIL);
  await page.fill('input[type="password"]', TEST_PASSWORD);
  await page.click('button[type="submit"]');

  // Wait for redirect to dashboard (auth + syncUser can take a few seconds)
  await page.waitForURL(/\/dashboard/, { timeout: 20000 });
  await expect(page).toHaveURL(/\/dashboard/);
}

export async function ensureLoggedIn(page: Page) {
  // Check if we're on a protected page already
  const url = page.url();
  if (url.includes('/dashboard') || url.includes('/history') || url.includes('/profile') || url.includes('/leaderboard') || url.includes('/play') || url.includes('/mystery')) {
    // Check if we got redirected to login
    try {
      await page.waitForURL(/\/login/, { timeout: 2000 });
      // We were redirected — need to login
      await loginAsTestUser(page);
    } catch {
      // Still on protected page — already logged in
    }
    return;
  }
  await loginAsTestUser(page);
}

export async function logout(page: Page) {
  const logoutButton = page.locator('button:has-text("Salir")');
  if (await logoutButton.isVisible()) {
    await logoutButton.click();
    await page.waitForURL(/\/login/, { timeout: 10000 });
  }
}

export { TEST_EMAIL, TEST_PASSWORD };
