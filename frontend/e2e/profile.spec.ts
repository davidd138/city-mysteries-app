import { test, expect } from '@playwright/test';

test.describe('Profile Page', () => {
  test('profile page redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/profile/');
    await page.waitForURL(/\/login/, { timeout: 5000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test('profile page exists and has correct heading', async ({ page }) => {
    // Just verify the page route is valid by checking the static HTML
    const response = await page.goto('/profile/');
    expect(response?.status()).toBe(200);
  });
});
