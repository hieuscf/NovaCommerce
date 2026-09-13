import { expect, test } from '@playwright/test';

test('storefront home loads @smoke', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'NovaCommerce' }).first()).toBeVisible();
});

test('login page is reachable @smoke', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
  await expect(page.getByLabel(/email address/i)).toBeVisible();
});

test('register page is reachable @smoke', async ({ page }) => {
  await page.goto('/register');
  await expect(page.getByRole('heading', { name: /create your account at/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Create Account', exact: true })).toBeVisible();
  await expect(page.getByText('Password requirements')).toBeVisible();
});

test('unauthorized page is reachable @smoke', async ({ page }) => {
  await page.goto('/unauthorized');
  await expect(page.getByRole('heading', { name: /access restricted/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /go to home/i })).toBeVisible();
});
