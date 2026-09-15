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

test('unauthenticated orders visit redirects to login @smoke', async ({ page }) => {
  await page.goto('/orders');
  await expect(page).toHaveURL(/\/login\?.*returnUrl=%2Forders.*reason=session-required/, {
    timeout: 15_000,
  });
});

test('authenticated customer can view list, detail, and confirmation @smoke', async ({ page }) => {
  await mockGatewayLogin(page);
  await signInFromLoginPage(page);
  await expect(page).toHaveURL('/', { timeout: 15_000 });

  await page.goto('/orders');
  await expect(page.getByRole('heading', { name: 'My Orders' })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText('#NC2026001')).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Filter orders' })).toBeVisible();

  await page.getByRole('link', { name: 'View Details' }).first().click();
  await expect(page).toHaveURL(/\/orders\/NC2026001/);
  await expect(page.getByRole('heading', { name: 'Order #NC2026001' })).toBeHidden();
  await expect(page.getByText(/Order Details/i)).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Order Status' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'MacBook Air M2 13"' })).toBeVisible();
  await expect(page.getByText('$1,843.56')).toBeVisible();

  await page.goto('/orders/confirmed');
  await expect(page.getByRole('heading', { name: 'Order Confirmed!' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Continue Shopping' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'View My Orders' })).toBeVisible();
});
