import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('app loads and redirects to login', async ({ page }) => {
    await page.goto('/');
    // Should redirect to login page
    await page.waitForURL(/\/login/);
    await expect(page).toHaveURL(/\/login/);
  });

  test('login page has correct title', async ({ page }) => {
    await page.goto('/login/');
    await expect(page.locator('h1')).toContainText('City Mysteries');
  });

  test('login page has email and password fields', async ({ page }) => {
    await page.goto('/login/');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('login page has submit button', async ({ page }) => {
    await page.goto('/login/');
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toContainText('Acceder al Caso');
  });

  test('login page has link to register', async ({ page }) => {
    await page.goto('/login/');
    const registerLink = page.locator('a[href="/register/"]');
    await expect(registerLink).toBeVisible();
    await expect(registerLink).toContainText('Solicitar acceso');
  });
});
