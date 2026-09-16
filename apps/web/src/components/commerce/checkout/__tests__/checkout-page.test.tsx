import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CheckoutPage } from '../checkout-page';
import { getCheckoutPage } from '@/lib/checkout/get-checkout-page';

const { push, placeCheckoutOrder } = vi.hoisted(() => ({
  push: vi.fn(),
  placeCheckoutOrder: vi.fn().mockResolvedValue({
    orderId: 'order-1',
    orderNumber: 'ORD-ABCDEF12',
  }),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace: vi.fn() }),
}));

vi.mock('@/lib/checkout/place-order', () => ({
  placeCheckoutOrder,
}));

async function fillCardPayment(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/card number/i), '4111111111111111');
  await user.clear(screen.getByLabelText(/cardholder name/i));
  await user.type(screen.getByLabelText(/cardholder name/i), 'Alex Johnson');
  await user.type(screen.getByLabelText(/expiration date/i), '1229');
  await user.type(screen.getByLabelText(/cvv\/cvc/i), '123');
  await user.type(screen.getByLabelText(/otp code/i), '123456');
}

describe('CheckoutPage', () => {
  beforeEach(() => {
    push.mockClear();
    placeCheckoutOrder.mockClear();
    placeCheckoutOrder.mockResolvedValue({
      orderId: 'order-1',
      orderNumber: 'ORD-ABCDEF12',
    });
  });

  it('renders the Alloy checkout details from the fixture cart', () => {
    render(<CheckoutPage checkout={getCheckoutPage()} />);

    expect(screen.getByRole('heading', { level: 1, name: 'Checkout' })).toBeInTheDocument();
    expect(screen.queryByText(/complete your order in a few simple steps/i)).not.toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toHaveTextContent('Checkout');
    expect(screen.getByRole('heading', { name: 'Customer Information' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Shipping Address' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute(
      'href',
      '/login?returnUrl=%2Fcheckout',
    );
    expect(screen.getByLabelText(/full name/i)).toHaveValue('Alex Johnson');
    expect(screen.getByLabelText(/email address/i)).toHaveValue('alex.johnson@example.com');
    expect(screen.getByLabelText(/phone number/i)).toHaveValue('+84 912 345 678');
    expect(screen.getByLabelText(/address line 1/i)).toHaveValue('123 Tech Street');
    expect(screen.getByRole('heading', { name: 'Order Summary' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'MacBook Air M2 13"' })).toHaveAttribute(
      'href',
      '/products/macbook-air-m2',
    );
    expect(screen.getByText('$1,986.00')).toBeInTheDocument();
    expect(screen.getByText('$2,144.88')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Proceed to Payment' })).toBeEnabled();
    expect(screen.getByText('Free Shipping')).toBeInTheDocument();
  });

  it('keeps the user on details and lists field errors when required fields are cleared', async () => {
    const user = userEvent.setup();
    render(<CheckoutPage checkout={getCheckoutPage()} />);

    await user.clear(screen.getByLabelText(/full name/i));
    await user.click(screen.getByRole('button', { name: 'Continue to Payment' }));

    expect(await screen.findByRole('heading', { name: 'There is a problem' })).toBeInTheDocument();
    expect(screen.getAllByText(/full name is required/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { name: 'Customer Information' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Payment Gateway' })).not.toBeInTheDocument();
  });

  it('opens the Payment Gateway and requires card details before review', async () => {
    const user = userEvent.setup();
    render(<CheckoutPage checkout={getCheckoutPage()} />);

    await user.click(screen.getByRole('button', { name: 'Continue to Payment' }));

    expect(await screen.findByRole('heading', { name: 'Payment Method' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Payment Gateway' })).not.toBeInTheDocument();
    expect(screen.queryByText(/secure and encrypted payment processing/i)).not.toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toHaveTextContent('Payment');
    expect(screen.getByText('Credit / Debit Card')).toBeInTheDocument();
    expect(screen.getByText('PayPal')).toBeInTheDocument();
    expect(screen.getByText('QR Pay')).toBeInTheDocument();
    expect(screen.getByText('Google Pay')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Card Information' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'OTP Verification' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Edit Cart' })).toHaveAttribute('href', '/cart');
    expect(screen.queryByText('VNPay')).not.toBeInTheDocument();
    expect(screen.queryByText('MoMo')).not.toBeInTheDocument();

    const payment = screen.getByRole('heading', { name: 'Payment Method' }).closest('section');
    expect(payment).toBeTruthy();
    await user.click(within(payment!).getByRole('button', { name: /Pay Now/i }));
    expect(await screen.findByRole('heading', { name: 'There is a problem' })).toBeInTheDocument();
    expect(screen.getAllByText(/enter a valid card number/i).length).toBeGreaterThan(0);

    await fillCardPayment(user);
    await user.click(within(payment!).getByRole('button', { name: /Pay Now/i }));

    expect(await screen.findByRole('heading', { name: 'Review Order' })).toBeInTheDocument();
    expect(screen.getByText('Alex Johnson')).toBeInTheDocument();
    expect(screen.getByText('Credit / Debit Card')).toBeInTheDocument();

    const review = screen.getByRole('heading', { name: 'Review Order' }).closest('section');
    expect(review).toBeTruthy();
    await user.click(within(review!).getByRole('button', { name: 'Place order' }));
    await vi.waitFor(() => {
      expect(placeCheckoutOrder).toHaveBeenCalled();
      expect(push).toHaveBeenCalledWith('/orders/confirmed');
    });
    expect(screen.queryByRole('heading', { name: 'Order Confirmed!' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Payment Gateway' })).not.toBeInTheDocument();
  }, 10_000);

  it('lets a wallet method skip card details', async () => {
    const user = userEvent.setup();
    render(<CheckoutPage checkout={getCheckoutPage()} />);

    await user.click(screen.getByRole('button', { name: 'Continue to Payment' }));
    expect(await screen.findByRole('heading', { name: 'Payment Method' })).toBeInTheDocument();

    await user.click(screen.getByText('QR Pay'));
    expect(screen.getByRole('heading', { name: 'Scan to pay' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Card Information' })).not.toBeInTheDocument();

    await user.click(screen.getByText('PayPal'));
    expect(screen.getByText(/continue with paypal/i)).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Card Information' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Pay Now/i }));
    expect(await screen.findByRole('heading', { name: 'Review Order' })).toBeInTheDocument();
    expect(screen.getByText('PayPal')).toBeInTheDocument();
  });

  it('updates the summary when a line quantity changes', async () => {
    const user = userEvent.setup();
    render(<CheckoutPage checkout={getCheckoutPage()} />);

    const macbook = screen.getByRole('link', { name: 'MacBook Air M2 13"' }).closest('li');
    expect(macbook).toBeTruthy();
    await user.click(within(macbook!).getByRole('button', { name: 'Increase quantity' }));

    expect(screen.getByText('$2,985.00')).toBeInTheDocument();
  });

  it('shows an empty checkout when the last item is removed', async () => {
    const user = userEvent.setup();
    render(<CheckoutPage checkout={getCheckoutPage()} />);

    await user.click(screen.getByRole('button', { name: 'Remove MacBook Air M2 13" from order' }));
    await user.click(screen.getByRole('button', { name: 'Remove Sony WH-1000XM5 from order' }));
    await user.click(screen.getByRole('button', { name: 'Remove Apple Watch Series 10 from order' }));

    expect(screen.getByRole('heading', { name: 'Your checkout is empty' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Order Summary' })).not.toBeInTheDocument();
  });
});
