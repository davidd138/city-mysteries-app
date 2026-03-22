import { test, expect } from '@playwright/test';

test.describe('PWA Support', () => {
  test('manifest.json is accessible', async ({ page }) => {
    const response = await page.goto('/manifest.json');
    expect(response?.status()).toBe(200);
    const body = await response?.json();
    expect(body.name).toContain('City Mysteries');
    expect(body.short_name).toBe('City Mysteries');
    expect(body.display).toBe('standalone');
    expect(body.theme_color).toBe('#0a0e1a');
  });

  test('service worker file is accessible', async ({ page }) => {
    const response = await page.goto('/sw.js');
    expect(response?.status()).toBe(200);
  });

  test('icon SVG is accessible', async ({ page }) => {
    const response = await page.goto('/icons/icon-192.svg');
    expect(response?.status()).toBe(200);
  });

  test('HTML has manifest link', async ({ page }) => {
    await page.goto('/login/');
    const manifest = await page.locator('link[rel="manifest"]');
    await expect(manifest).toHaveAttribute('href', '/manifest.json');
  });
});
