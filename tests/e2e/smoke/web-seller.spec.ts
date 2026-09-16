import { expect, test } from '@playwright/test';

test('unregistered seller onboarding is reachable @smoke', async ({ page }) => {
  await page.goto('/seller');
  await expect(page.getByRole('heading', { name: /start your business/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Become a Seller' })).toBeVisible();
  await expect(page.getByLabel(/^business name/i)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Next Step' })).toBeVisible();
});
