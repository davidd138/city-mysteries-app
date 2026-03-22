import { test, expect } from '@playwright/test';

test.describe('Design System', () => {
  test('login page uses detective theme colors', async ({ page }) => {
    await page.goto('/login/');
    // Should have the noir detective design, not generic stone/amber
    const content = await page.content();
    expect(content).toContain('Acceder al Caso');
    expect(content).toContain('Acceso de Agente');
  });

  test('login page has magnifying glass icon', async ({ page }) => {
    await page.goto('/login/');
    const svg = page.locator('svg circle[r="8"]');
    expect(await svg.count()).toBeGreaterThan(0);
  });

  test('register page uses detective terminology', async ({ page }) => {
    await page.goto('/register/');
    const content = await page.content();
    expect(content).toContain('Nombre en Clave');
    expect(content).toContain('Solicitar Acceso');
    expect(content).toContain('Datos del Agente');
  });

  test('login form inputs have input-noir class', async ({ page }) => {
    await page.goto('/login/');
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toHaveClass(/input-noir/);
  });

  test('login has btn-detective styled button', async ({ page }) => {
    await page.goto('/login/');
    const button = page.locator('button[type="submit"]');
    await expect(button).toHaveClass(/btn-detective/);
  });

  test('pages use custom font-serif variable', async ({ page }) => {
    await page.goto('/login/');
    const html = await page.content();
    expect(html).toContain('font-serif');
  });

  test('app uses midnight color scheme, not stone', async ({ page }) => {
    await page.goto('/login/');
    const html = await page.content();
    // The new design uses midnight, not stone
    expect(html).toContain('midnight');
  });
});
