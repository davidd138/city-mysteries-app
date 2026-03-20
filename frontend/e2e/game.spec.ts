import { test, expect } from '@playwright/test';

test.describe('Game Pages (unauthenticated)', () => {
  test('dashboard redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/dashboard/');
    // Should redirect to login since not authenticated
    await page.waitForURL(/\/login/, { timeout: 5000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test('history redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/history/');
    await page.waitForURL(/\/login/, { timeout: 5000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test('play page redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/play/');
    await page.waitForURL(/\/login/, { timeout: 5000 });
    await expect(page).toHaveURL(/\/login/);
  });
});
