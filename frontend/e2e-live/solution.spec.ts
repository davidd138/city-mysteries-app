import { test, expect } from '@playwright/test';
import { loginAsTestUser } from './helpers/auth';

test.describe.serial('Solution Submission - Live', () => {
  test('submit WRONG solution shows Veredicto Incorrecto', async ({ page }) => {
    await loginAsTestUser(page);
    // Start new game
    await page.goto('/mystery/?id=madrid-cervantes-001');
    await page.waitForSelector('text=Aceptar el Caso', { timeout: 15000 });
    await page.click('text=Aceptar el Caso');
    await page.waitForURL(/\/play/, { timeout: 15000 });

    // Wait for page to stabilize then click Resolver Caso
    await page.waitForTimeout(3000);
    await page.locator('button:has-text("Resolver Caso")').click({ timeout: 10000 });
    await page.waitForSelector('text=Presentar Solucion', { timeout: 10000 });

    // Fill wrong solution
    await page.fill('input[placeholder*="culpable"]', 'Napoleon');
    await page.locator('button:has-text("Presentar Veredicto")').click();

    // Should show incorrect result
    await expect(page.locator('text=Veredicto Incorrecto')).toBeVisible({ timeout: 15000 });
  });

  test('submit CORRECT solution shows Caso Resuelto with score', async ({ page }) => {
    await loginAsTestUser(page);
    // Start new game
    await page.goto('/mystery/?id=madrid-cervantes-001');
    await page.waitForSelector('text=Aceptar el Caso', { timeout: 15000 });
    await page.click('text=Aceptar el Caso');
    await page.waitForURL(/\/play/, { timeout: 15000 });

    // Wait for page to stabilize then click Resolver Caso
    await page.waitForTimeout(3000);
    await page.locator('button:has-text("Resolver Caso")').click({ timeout: 10000 });
    await page.waitForSelector('text=Presentar Solucion', { timeout: 10000 });

    // Fill correct solution
    await page.fill('input[placeholder*="culpable"]', 'Lope de Vega');
    await page.locator('button:has-text("Presentar Veredicto")').click();

    // Should show correct result with score
    await expect(page.getByRole('heading', { name: 'Caso Resuelto' })).toBeVisible({ timeout: 15000 });
    // Score should be visible
    await expect(page.getByText('Puntos', { exact: true })).toBeVisible({ timeout: 5000 });
  });
});
