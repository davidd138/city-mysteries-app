import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('all main routes return 200', async ({ page }) => {
    const routes = ['/login/', '/register/', '/dashboard/', '/history/', '/profile/', '/leaderboard/', '/mystery/', '/play/'];
    for (const route of routes) {
      const response = await page.goto(route);
      expect(response?.status(), `Route ${route} should return 200`).toBe(200);
    }
  });

  test('login page has City Mysteries branding', async ({ page }) => {
    await page.goto('/login/');
    const content = await page.content();
    expect(content).toContain('City Mysteries');
    expect(content).toContain('Agencia de Investigacion');
  });

  test('login page has Confidencial stamp', async ({ page }) => {
    await page.goto('/login/');
    const content = await page.content();
    expect(content).toContain('Confidencial');
  });

  test('register page has Nuevo Caso stamp', async ({ page }) => {
    await page.goto('/register/');
    const content = await page.content();
    expect(content).toContain('Nuevo Caso');
  });

  test('register page has Formulario de Reclutamiento', async ({ page }) => {
    await page.goto('/register/');
    const content = await page.content();
    expect(content).toContain('Formulario de Reclutamiento');
  });

  test('protected routes redirect to login', async ({ page }) => {
    const protectedRoutes = ['/dashboard/', '/history/', '/profile/', '/leaderboard/'];
    for (const route of protectedRoutes) {
      await page.goto(route);
      await page.waitForURL(/\/login/, { timeout: 5000 });
      expect(page.url()).toContain('/login');
    }
  });
});
