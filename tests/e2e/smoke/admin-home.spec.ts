import { expect, test } from '@playwright/test';

test('admin dashboard loads @smoke', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Good morning, Admin/i })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Admin navigation' })).toBeVisible();
  await expect(page.getByText('Total Revenue')).toBeVisible();
  await expect(page.getByRole('img', { name: /Sales overview/i })).toBeVisible();
});
