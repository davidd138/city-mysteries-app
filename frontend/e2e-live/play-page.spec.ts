import { test, expect } from '@playwright/test';
import { loginAsTestUser } from './helpers/auth';

test.describe('Play Page - Live', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    // Start a new game via mystery detail
    await page.goto('/mystery/?id=madrid-cervantes-001');
    await page.waitForSelector('text=Aceptar el Caso', { timeout: 15000 });
    await page.click('text=Aceptar el Caso');
    await page.waitForURL(/\/play/, { timeout: 15000 });
  });

  test('play page shows mystery title', async ({ page }) => {
    await expect(page.locator('text=Quien asesino a Cervantes')).toBeVisible({ timeout: 10000 });
  });

  test('play page shows timer counting', async ({ page }) => {
    // Timer shows MM:SS format - find it by the clock icon nearby
    await page.waitForTimeout(3000);
    // Look for the timer text pattern in the page
    const pageContent = await page.content();
    expect(pageContent).toMatch(/\d{2}:\d{2}/);
  });

  test('play page shows hint button with counter', async ({ page }) => {
    const hintButton = page.locator('button:has-text("0/3")');
    await expect(hintButton).toBeVisible({ timeout: 10000 });
  });

  test('play page shows Resolver Caso button', async ({ page }) => {
    await expect(page.locator('text=Resolver Caso')).toBeVisible({ timeout: 10000 });
  });

  test('play page has character gallery toggle', async ({ page }) => {
    // The gallery toggle button has the people icon
    const toggleButton = page.locator('button[title*="sospechosos"], button[title*="galeria"]');
    await expect(toggleButton).toBeVisible({ timeout: 10000 });
  });

  test('play page shows map container', async ({ page }) => {
    // Map container should exist even if Mapbox errors
    const mapContainer = page.locator('[class*="border-aged"]');
    await expect(mapContainer).toBeVisible({ timeout: 10000 });
  });
});
