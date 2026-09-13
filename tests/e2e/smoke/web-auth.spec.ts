import { expect, test, type Page } from '@playwright/test';

async function mockGatewayLogin(page: Page) {
  await page.route('**/api/v1/auth/login', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          accessToken: 'mock-access-e2e@novacommerce.dev',
          refreshToken: 'mock-refresh-e2e@novacommerce.dev',
          tokenType: 'Bearer',
          expiresIn: 900,
        },
        meta: { requestId: 'e2e-login' },
      }),
    });
  });

  await page.route('**/api/v1/auth/logout', async (route) => {
    await route.fulfill({ status: 204, body: '' });
  });
}

async function signInFromLoginPage(page: Page) {
  await page.goto('/login');
  await page.getByLabel(/email address/i).fill('e2e@novacommerce.dev');
  await page.getByRole('textbox', { name: 'Password' }).fill('Password8');
  await page.getByRole('button', { name: /^sign in$/i }).click();
}

test('unauthenticated account visit redirects to login @smoke', async ({ page }) => {
  await page.goto('/account');
  await expect(page).toHaveURL(/\/login\?.*reason=session-required/, { timeout: 15_000 });
  await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
});

test('login persists across a full page reload @smoke', async ({ page }) => {
  await mockGatewayLogin(page);
  await signInFromLoginPage(page);
  await expect(page).toHaveURL('/', { timeout: 15_000 });
  await page.goto('/account');
  await expect(page.getByRole('heading', { name: 'My Account' })).toBeVisible({ timeout: 15_000 });
  await page.reload();
  await expect(page.getByRole('heading', { name: 'My Account' })).toBeVisible({ timeout: 15_000 });
  await expect(page).not.toHaveURL(/\/login/);
});

test('logout returns the visitor to an unauthenticated account redirect @smoke', async ({
  page,
}) => {
  await mockGatewayLogin(page);
  await signInFromLoginPage(page);
  await page.goto('/account?section=security');
  await expect(page.getByRole('heading', { name: 'Account security' })).toBeVisible();
  await page.getByRole('button', { name: /sign out/i }).click();
  await expect(page).toHaveURL('/');
  await page.goto('/account');
  await expect(page).toHaveURL(/\/login\?.*reason=session-required/);
});
