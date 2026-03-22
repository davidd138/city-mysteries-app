import { test, expect } from '@playwright/test';
import { loginAsTestUser } from './helpers/auth';

test.describe('Mystery Detail - Live', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
  });

  test('mystery detail page loads for Madrid mystery', async ({ page }) => {
    await page.goto('/mystery/?id=madrid-cervantes-001');
    await page.waitForSelector('text=Quien asesino a Cervantes', { timeout: 15000 });
    await expect(page.locator('text=Quien asesino a Cervantes')).toBeVisible();
  });

  test('shows case file classification stamp', async ({ page }) => {
    await page.goto('/mystery/?id=madrid-cervantes-001');
    await expect(page.getByText('Clasificado', { exact: true })).toBeVisible({ timeout: 15000 });
  });

  test('shows city and difficulty metadata', async ({ page }) => {
    await page.goto('/mystery/?id=madrid-cervantes-001');
    await page.waitForSelector('text=Madrid', { timeout: 15000 });
    await expect(page.locator('text=Madrid').first()).toBeVisible();
  });

  test('shows Briefing Confidencial section', async ({ page }) => {
    await page.goto('/mystery/?id=madrid-cervantes-001');
    await page.waitForSelector('text=Briefing Confidencial', { timeout: 15000 });
    await expect(page.locator('text=Briefing Confidencial')).toBeVisible();
  });

  test('shows suspect count without names', async ({ page }) => {
    await page.goto('/mystery/?id=madrid-cervantes-001');
    await page.waitForSelector('text=sospechosos identificados', { timeout: 15000 });
    await expect(page.locator('text=sospechosos identificados')).toBeVisible();
  });

  test('has Aceptar el Caso button', async ({ page }) => {
    await page.goto('/mystery/?id=madrid-cervantes-001');
    await page.waitForSelector('text=Aceptar el Caso', { timeout: 15000 });
    await expect(page.locator('text=Aceptar el Caso')).toBeVisible();
  });

  test('has Volver al Archivo button that goes to dashboard', async ({ page }) => {
    await page.goto('/mystery/?id=madrid-cervantes-001');
    await page.waitForSelector('text=Volver al Archivo', { timeout: 15000 });
    await page.click('text=Volver al Archivo');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('clicking Aceptar el Caso starts game and goes to play', async ({ page }) => {
    await page.goto('/mystery/?id=madrid-cervantes-001');
    await page.waitForSelector('text=Aceptar el Caso', { timeout: 15000 });
    await page.click('text=Aceptar el Caso');
    await page.waitForURL(/\/play/, { timeout: 15000 });
    await expect(page).toHaveURL(/\/play/);
    // URL should have mysteryId and sessionId
    const url = page.url();
    expect(url).toContain('mysteryId=madrid-cervantes-001');
    expect(url).toContain('sessionId=');
  });
});
