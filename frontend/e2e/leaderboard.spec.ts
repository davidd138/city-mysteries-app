import { test, expect } from '@playwright/test';

test.describe('Leaderboard Page', () => {
  test('leaderboard page redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/leaderboard/');
    await page.waitForURL(/\/login/, { timeout: 5000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test('leaderboard page route exists', async ({ page }) => {
    const response = await page.goto('/leaderboard/');
    expect(response?.status()).toBe(200);
  });

  test('leaderboard page redirects unauthenticated to login with City Mysteries branding', async ({ page }) => {
    await page.goto('/leaderboard/');
    await page.waitForURL(/\/login/, { timeout: 5000 });
    await expect(page.locator('h1')).toContainText('City Mysteries');
  });
});
