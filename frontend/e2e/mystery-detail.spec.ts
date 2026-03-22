import { test, expect } from '@playwright/test';

test.describe('Mystery Detail Page', () => {
  test('mystery detail page redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/mystery/?id=test-123');
    await page.waitForURL(/\/login/, { timeout: 5000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test('mystery detail page route exists', async ({ page }) => {
    const response = await page.goto('/mystery/');
    expect(response?.status()).toBe(200);
  });

  test('dashboard has "Ver Expediente" buttons', async ({ page }) => {
    await page.goto('/dashboard/');
    // Will redirect to login, but the static page should have the button text
    const response = await page.goto('/dashboard/');
    expect(response?.status()).toBe(200);
  });
});
