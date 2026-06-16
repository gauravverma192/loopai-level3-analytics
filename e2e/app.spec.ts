import { test, expect } from '@playwright/test';

test('loads scaffold and checks API health', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Analytics Platform' })).toBeVisible();
  await expect(page.getByText('API healthy')).toBeVisible();

  await page.getByRole('button', { name: 'Refresh health' }).click();
  await expect(page.getByText('API healthy')).toBeVisible();
});
