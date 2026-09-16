import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { SellerPage } from '../seller-page';
import { SellerRegisterForm } from '../seller-register-form';
import { getSellerPage } from '@/lib/seller/get-seller-page';

beforeAll(() => {
  if (!URL.createObjectURL) {
    URL.createObjectURL = vi.fn(() => 'blob:preview');
  }
  if (!URL.revokeObjectURL) {
    URL.revokeObjectURL = vi.fn();
  }
});

afterEach(() => {
  cleanup();
});

function renderShopDetails() {
  return render(<SellerRegisterForm page={getSellerPage()} initialStep="shop" />);
}

describe('SellerPage', () => {
  it('renders the unregistered Alloy seller application', () => {
    render(<SellerPage page={getSellerPage()} />);

    expect(screen.getByText('Seller Center')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: /start your business/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Become a Seller' })).toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'Seller registration progress' })).toHaveTextContent(
      'Business Information',
    );
    expect(screen.getByLabelText(/^business name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/business type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/legal business name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/số cccd \/ hộ chiếu/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Hộ kinh doanh / Doanh nghiệp' })).toBeInTheDocument();
    expect(screen.getByLabelText(/giấy chứng nhận đăng ký kinh doanh/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mã số thuế/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tên người đại diện theo pháp luật/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cccd người đại diện/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/business email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/address line 1/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/address line 2/i)).toBeInTheDocument();
    expect(screen.getByText('Your information is secure')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute(
      'href',
      '/login?returnUrl=%2Fseller',
    );
    expect(screen.getByRole('button', { name: 'Next Step' })).toBeEnabled();
    expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Your seller workspace' })).not.toBeInTheDocument();
  });

  it('keeps the user on business information when required fields are empty', async () => {
    const user = userEvent.setup();
    render(<SellerPage page={getSellerPage()} />);

    await user.click(screen.getByRole('button', { name: 'Next Step' }));

    expect(await screen.findByText('Business name is required')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Become a Seller' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Shop Details' })).not.toBeInTheDocument();
  });

  it('renders the registered workspace instead of the application form', () => {
    render(<SellerPage page={getSellerPage('registered')} />);

    expect(screen.getByRole('heading', { name: 'Your seller workspace' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Become a Seller' })).not.toBeInTheDocument();
  });
});

describe('SellerRegisterForm shop details', () => {
  it('renders shop details fields from the Alloy step 2 layout', () => {
    renderShopDetails();

    expect(screen.getByRole('heading', { name: 'Shop Details' })).toBeInTheDocument();
    expect(
      screen.getByText(
        /tell us about your shop. this helps us create your store and display your brand to customers/i,
      ),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/^shop name/i)).toBeInTheDocument();
    expect(screen.getByText('0/50')).toBeInTheDocument();
    expect(screen.getByLabelText(/shop category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/shop description/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Shop Logo & Banner' })).toBeInTheDocument();
    expect(screen.getByLabelText(/shop logo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/shop banner/i)).toBeInTheDocument();
    expect(screen.getAllByText('Click to upload or drag and drop')).toHaveLength(2);
    expect(screen.getByRole('heading', { name: 'Social Media & Website (Optional)' })).toBeInTheDocument();
    expect(screen.getByLabelText(/facebook page/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^instagram$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^website$/i)).toBeInTheDocument();
    expect(screen.getByText('Build your brand and grow your business')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument();
    expect(screen.queryByLabelText(/shop url/i)).not.toBeInTheDocument();
  });

  it('keeps the user on shop details when required shop fields are empty', async () => {
    const user = userEvent.setup();
    renderShopDetails();

    await user.click(screen.getByRole('button', { name: 'Next Step' }));

    expect(await screen.findByText('Shop name is required')).toBeInTheDocument();
    expect(screen.getByText('Shop category is required')).toBeInTheDocument();
    expect(screen.getByText('Shop description is required')).toBeInTheDocument();
    expect(screen.getByText('Shop logo is required')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Shop Details' })).toBeInTheDocument();
  });

  it('updates the shop name character count as the user types', () => {
    renderShopDetails();

    fireEvent.change(screen.getByLabelText(/^shop name/i), { target: { value: 'Nova' } });

    expect(screen.getByText('4/50')).toBeInTheDocument();
  });

  it('returns to business information from shop details', async () => {
    const user = userEvent.setup();
    renderShopDetails();

    await user.click(screen.getByRole('button', { name: 'Back' }));

    expect(await screen.findByRole('heading', { name: 'Become a Seller' })).toBeInTheDocument();
  });
});
