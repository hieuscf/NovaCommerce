import { expect, test } from '@playwright/test';

test('admin dashboard loads @smoke', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Admin navigation' })).toBeVisible();
});
