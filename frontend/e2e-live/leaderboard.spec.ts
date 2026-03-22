import { test, expect } from '@playwright/test';
import { loginAsTestUser } from './helpers/auth';

test.describe('Leaderboard - Live', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/leaderboard/');
  });

  test('leaderboard shows Salon de la Fama heading', async ({ page }) => {
    await expect(page.locator('text=Salon de la Fama')).toBeVisible({ timeout: 10000 });
  });

  test('leaderboard shows content or empty state', async ({ page }) => {
    await page.waitForTimeout(3000);
    const hasEntries = await page.locator('[class*="card-case-file"]').count();
    const hasEmpty = await page.locator('text=no hay detectives').count();
    expect(hasEntries + hasEmpty).toBeGreaterThan(0);
  });
});
