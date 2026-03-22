import { test, expect } from '@playwright/test';
import { loginAsTestUser, logout, TEST_EMAIL } from './helpers/auth';

test.describe('Full User Journey - Live', () => {
  test('complete user journey: login -> browse -> play -> solve -> history -> profile -> leaderboard -> logout', async ({ page }) => {
    // 1. Login
    await loginAsTestUser(page);
    await expect(page).toHaveURL(/\/dashboard/);

    // 2. Verify dashboard shows 2 mysteries
    await page.waitForSelector('text=Quien asesino a Cervantes', { timeout: 15000 });
    await expect(page.locator('text=El Fantasma de la Opera del Liceu')).toBeVisible();

    // 3. Click on Madrid mystery specifically -> verify detail page
    // Find the card containing "Cervantes" and click its Ver Expediente button
    const madridCard = page.locator('[class*="card-case-file"]:has-text("Cervantes")');
    await madridCard.locator('text=Ver Expediente').click();
    await page.waitForURL(/\/mystery.*madrid/, { timeout: 10000 });
    await expect(page.locator('text=Briefing Confidencial')).toBeVisible({ timeout: 10000 });

    // 4. Accept case -> verify play page loads
    await page.click('text=Aceptar el Caso');
    await page.waitForURL(/\/play/, { timeout: 15000 });
    // Wait for play page to fully load
    await page.waitForTimeout(5000);

    // 5. Verify timer is running
    const pageContent = await page.content();
    expect(pageContent).toMatch(/\d{2}:\d{2}/);

    // 6. Open solution modal
    await page.locator('button:has-text("Resolver Caso")').click({ timeout: 10000 });
    await expect(page.locator('text=Presentar Solucion')).toBeVisible({ timeout: 5000 });

    // 7. Submit correct solution
    await page.fill('input[placeholder*="culpable"]', 'Lope de Vega');
    await page.locator('button:has-text("Presentar Veredicto")').click();

    // 8. Verify Caso Resuelto with score
    await expect(page.getByRole('heading', { name: 'Caso Resuelto' })).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Puntos', { exact: true })).toBeVisible({ timeout: 5000 });
    await page.locator('button:has-text("Cerrar Expediente")').click();

    // 9. Navigate to history -> verify completed case
    await page.goto('/history/');
    await expect(page.locator('text=Archivo de Casos')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(3000);

    // 10. Navigate to profile -> verify stats
    await page.goto('/profile/');
    await expect(page.locator('text=Credencial de Agente')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Casos Totales')).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('main').getByText(TEST_EMAIL)).toBeVisible({ timeout: 5000 });

    // 11. Navigate to leaderboard
    await page.goto('/leaderboard/');
    await expect(page.locator('text=Salon de la Fama')).toBeVisible({ timeout: 10000 });

    // 12. Logout -> verify redirect to login
    await logout(page);
    await expect(page).toHaveURL(/\/login/);
  });
});
