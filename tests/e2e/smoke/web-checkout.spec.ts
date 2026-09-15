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

test('unauthenticated checkout visit redirects to login @smoke', async ({ page }) => {
  await page.goto('/checkout');
  await expect(page).toHaveURL(/\/login\?.*returnUrl=%2Fcheckout.*reason=session-required/, {
    timeout: 15_000,
  });
});

test('authenticated checkout shows customer and shipping details @smoke', async ({ page }) => {
  await mockGatewayLogin(page);
  await signInFromLoginPage(page);
  await expect(page).toHaveURL('/', { timeout: 15_000 });
  await page.goto('/checkout');
  await expect(page.getByRole('heading', { name: 'Customer Information' })).toBeVisible({
    timeout: 15_000,
  });
  await expect(page.getByRole('heading', { name: 'Shipping Address' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Order Summary' })).toBeVisible();
  await expect(page.getByLabel(/full name/i)).toHaveValue('Alex Johnson');
  await expect(page.getByRole('button', { name: 'Continue to Payment' })).toBeVisible();
  await page.getByRole('button', { name: 'Continue to Payment' }).click();
  await expect(page.getByRole('heading', { name: 'Payment Method' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Payment Gateway' })).toHaveCount(0);
  await expect(page.getByText('Credit / Debit Card')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Card Information' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'OTP Verification' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Pay Now/i })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Edit Cart' })).toBeVisible();
});
