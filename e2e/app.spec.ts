import { test, expect } from '@playwright/test';

test('loads dashboard overall performance', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Analytics Platform' })).toBeVisible();
  await expect(page.getByText(/[\d.]+% hit ratio/)).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText('Total stores')).toBeVisible();
  await expect(page.getByText('Fleet overview')).toBeVisible();
});

test('stores page shows filter bar above table', async ({ page }) => {
  await page.goto('/stores');
  await expect(page.getByLabel('Chain')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Downtown Subway' })).toBeVisible();
});

test('store detail page shows metrics and trends', async ({ page }) => {
  await page.goto('/stores/store_0001');
  await expect(page.getByRole('heading', { name: 'Downtown Subway' })).toBeVisible();
  await expect(page.getByText('24-hour order trends')).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toContainText('Stores');
});
