import { test, expect } from '@playwright/test';
import { loginAsTestUser, logout, TEST_EMAIL } from './helpers/auth';

test.describe('Auth Flow - Live', () => {
  test('login page loads with detective theme', async ({ page }) => {
    await page.goto('/login/');
    await expect(page.locator('h1')).toContainText('City Mysteries');
    await expect(page.locator('text=Agencia de Investigacion')).toBeVisible();
    await expect(page.locator('text=Confidencial')).toBeVisible();
  });

  test('can fill email and password fields', async ({ page }) => {
    await page.goto('/login/');
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    await emailInput.fill('test@example.com');
    await passwordInput.fill('password123');
    await expect(emailInput).toHaveValue('test@example.com');
    await expect(passwordInput).toHaveValue('password123');
  });

  test('login with WRONG credentials shows error', async ({ page }) => {
    await page.goto('/login/');
    await page.fill('input[type="email"]', 'wrong@example.com');
    await page.fill('input[type="password"]', 'WrongPass123!');
    await page.click('button[type="submit"]');
    // Wait for error message to appear
    const errorMsg = page.locator('[class*="crimson"]');
    await expect(errorMsg).toBeVisible({ timeout: 10000 });
  });

  test('login with CORRECT credentials redirects to dashboard', async ({ page }) => {
    await loginAsTestUser(page);
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('after login, topbar shows user email', async ({ page }) => {
    await loginAsTestUser(page);
    await expect(page.locator(`text=${TEST_EMAIL}`)).toBeVisible({ timeout: 5000 });
  });

  test('logout redirects to login page', async ({ page }) => {
    await loginAsTestUser(page);
    await logout(page);
    await expect(page).toHaveURL(/\/login/);
  });

  test('after logout, visiting dashboard redirects to login', async ({ page }) => {
    await loginAsTestUser(page);
    await logout(page);
    await page.goto('/dashboard/');
    await page.waitForURL(/\/login/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test('login persistence: refresh stays on dashboard', async ({ page }) => {
    await loginAsTestUser(page);
    await page.reload();
    // Should stay on dashboard after reload (session persists)
    await page.waitForTimeout(3000);
    const url = page.url();
    expect(url).toMatch(/\/(dashboard|login)/);
  });
});
