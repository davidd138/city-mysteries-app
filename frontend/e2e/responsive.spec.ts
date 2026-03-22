import { test, expect } from '@playwright/test';

test.describe('Responsive Design', () => {
  test('login page renders correctly on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/login/');
    await expect(page.locator('h1')).toContainText('City Mysteries');
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('login page renders correctly on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/login/');
    await expect(page.locator('h1')).toContainText('City Mysteries');
  });

  test('login page renders correctly on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/login/');
    await expect(page.locator('h1')).toContainText('City Mysteries');
  });

  test('register page works on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/register/');
    await expect(page.locator('input[type="text"]')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });
});
