import { test, expect } from '@playwright/test';
import { loginAsTestUser } from './helpers/auth';

test.describe('Dashboard - Live', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
  });

  test('dashboard shows Casos Abiertos heading', async ({ page }) => {
    await expect(page.locator('h2:has-text("Casos Abiertos")')).toBeVisible({ timeout: 10000 });
  });

  test('dashboard displays at least 2 mystery cards', async ({ page }) => {
    // Wait for mysteries to load
    await page.waitForSelector('[class*="card-case-file"]', { timeout: 15000 });
    const cards = page.locator('[class*="card-case-file"]');
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('Madrid mystery card is visible', async ({ page }) => {
    await page.waitForSelector('text=Quien asesino a Cervantes', { timeout: 15000 });
    await expect(page.locator('text=Quien asesino a Cervantes')).toBeVisible();
  });

  test('Barcelona mystery card is visible', async ({ page }) => {
    await page.waitForSelector('text=El Fantasma de la Opera del Liceu', { timeout: 15000 });
    await expect(page.locator('text=El Fantasma de la Opera del Liceu')).toBeVisible();
  });

  test('mystery cards show city name', async ({ page }) => {
    await page.waitForSelector('text=Madrid', { timeout: 15000 });
    await expect(page.locator('text=Madrid').first()).toBeVisible();
    await expect(page.locator('text=Barcelona').first()).toBeVisible();
  });

  test('mystery cards show sospechosos count', async ({ page }) => {
    await page.waitForSelector('text=sospechosos', { timeout: 15000 });
    const suspects = page.locator('text=sospechosos');
    const count = await suspects.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('mystery cards have Ver Expediente button', async ({ page }) => {
    await page.waitForSelector('text=Ver Expediente', { timeout: 15000 });
    const buttons = page.locator('text=Ver Expediente');
    const count = await buttons.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('clicking Ver Expediente navigates to mystery detail', async ({ page }) => {
    await page.waitForSelector('text=Ver Expediente', { timeout: 15000 });
    const firstButton = page.locator('text=Ver Expediente').first();
    await firstButton.click();
    await page.waitForURL(/\/mystery/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/mystery/);
  });
});
