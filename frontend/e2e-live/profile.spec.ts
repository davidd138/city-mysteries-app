import { test, expect } from '@playwright/test';
import { loginAsTestUser, TEST_EMAIL } from './helpers/auth';

test.describe('Profile Page - Live', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/profile/');
  });

  test('profile page shows Credencial de Agente heading', async ({ page }) => {
    await expect(page.locator('text=Credencial de Agente')).toBeVisible({ timeout: 10000 });
  });

  test('profile shows user email', async ({ page }) => {
    await expect(page.getByRole('main').getByText(TEST_EMAIL)).toBeVisible({ timeout: 10000 });
  });

  test('profile shows statistics section', async ({ page }) => {
    await expect(page.locator('text=Casos Totales')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Casos Resueltos')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Tasa de Exito')).toBeVisible({ timeout: 10000 });
  });

  test('profile shows detective rank', async ({ page }) => {
    await expect(page.locator('text=Rango de Detective')).toBeVisible({ timeout: 10000 });
  });

  test('profile shows badges section', async ({ page }) => {
    // Badges load from a separate API call, may take a moment
    await page.waitForTimeout(3000);
    await expect(page.locator('text=/Insignias \\(\\d+\\/\\d+\\)/')).toBeVisible({ timeout: 15000 });
  });
});
