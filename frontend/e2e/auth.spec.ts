import { test, expect } from '@playwright/test';

test.describe('Auth Pages', () => {
  test('can navigate from login to register', async ({ page }) => {
    await page.goto('/login/');
    await page.click('a[href="/register/"]');
    await page.waitForURL(/\/register/);
    await expect(page).toHaveURL(/\/register/);
    await expect(page.locator('h1')).toContainText('Nuevo Agente');
  });

  test('can navigate from register to login', async ({ page }) => {
    await page.goto('/register/');
    await page.click('a[href="/login/"]');
    await page.waitForURL(/\/login/);
    await expect(page).toHaveURL(/\/login/);
  });

  test('register page has name, email and password fields', async ({ page }) => {
    await page.goto('/register/');
    await expect(page.locator('input[type="text"]')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('register page has create account button', async ({ page }) => {
    await page.goto('/register/');
    await expect(page.locator('button[type="submit"]')).toContainText('Solicitar Acceso');
  });

  test('login form requires email', async ({ page }) => {
    await page.goto('/login/');
    await page.fill('input[type="password"]', 'testpassword');
    await page.click('button[type="submit"]');
    // HTML5 validation should prevent submission
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toHaveAttribute('required', '');
  });
});
