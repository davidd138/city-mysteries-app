import { test, expect } from '@playwright/test';
import { loginAsTestUser } from './helpers/auth';

test.describe('History Page - Live', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/history/');
  });

  test('history page shows Archivo de Casos heading', async ({ page }) => {
    await expect(page.locator('text=Archivo de Casos')).toBeVisible({ timeout: 10000 });
  });

  test('history page shows past game sessions or empty state', async ({ page }) => {
    // Wait for content to load
    await page.waitForTimeout(3000);
    // Should show either session cards or empty state message
    const hasCards = await page.locator('[class*="card-case-file"]').count();
    const hasEmpty = await page.locator('text=El archivo esta vacio').count();
    expect(hasCards + hasEmpty).toBeGreaterThan(0);
  });
});
