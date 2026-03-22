import { test, expect } from '@playwright/test';
import { loginAsTestUser, TEST_EMAIL } from './helpers/auth';

test.describe('Navigation - Live', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
  });

  test('sidebar shows navigation items on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/dashboard/');
    await page.waitForTimeout(2000);
    await expect(page.locator('aside')).toBeVisible();
    await expect(page.locator('aside >> text=Casos')).toBeVisible();
    await expect(page.locator('aside >> text=Archivo')).toBeVisible();
    await expect(page.locator('aside >> text=Ranking')).toBeVisible();
  });

  test('clicking nav items navigates correctly', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/dashboard/');
    await page.waitForTimeout(2000);

    // Navigate to history
    await page.click('aside >> text=Archivo');
    await page.waitForURL(/\/history/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/history/);

    // Navigate to leaderboard
    await page.click('aside >> text=Ranking');
    await page.waitForURL(/\/leaderboard/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/leaderboard/);

    // Navigate back to dashboard
    await page.click('aside >> text=Casos');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('topbar shows user email with profile link', async ({ page }) => {
    await page.goto('/dashboard/');
    await page.waitForTimeout(2000);
    const emailLink = page.locator(`a:has-text("${TEST_EMAIL}")`);
    await expect(emailLink).toBeVisible({ timeout: 10000 });
  });

  test('clicking email navigates to profile', async ({ page }) => {
    await page.goto('/dashboard/');
    await page.waitForTimeout(2000);
    const emailLink = page.locator(`a:has-text("${TEST_EMAIL}")`);
    await emailLink.click();
    await page.waitForURL(/\/profile/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/profile/);
  });

  test('sound toggle button exists in topbar', async ({ page }) => {
    await page.goto('/dashboard/');
    await page.waitForTimeout(2000);
    const soundButton = page.locator('button[title*="Silenciar"], button[title*="Activar sonido"]');
    await expect(soundButton).toBeVisible({ timeout: 5000 });
  });

  test('mobile: bottom nav visible on small viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/dashboard/');
    await page.waitForTimeout(3000);
    const bottomNav = page.locator('nav[aria-label*="movil"]');
    await expect(bottomNav).toBeVisible({ timeout: 5000 });
  });

  test('mobile: sidebar hidden on small viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/dashboard/');
    await page.waitForTimeout(2000);
    const sidebar = page.locator('aside');
    await expect(sidebar).not.toBeVisible();
  });
});
