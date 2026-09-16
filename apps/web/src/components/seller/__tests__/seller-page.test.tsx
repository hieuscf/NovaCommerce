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
      'Verification',
    );
    expect(screen.getByRole('list', { name: 'Seller registration progress' })).toHaveTextContent(
      'Terms & Conditions',
    );
    expect(screen.getByLabelText(/^business name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/business type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/legal business name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/national id \/ passport/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Business Registration' })).toBeInTheDocument();
    expect(screen.getByLabelText(/business registration certificate/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^tax id/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/legal representative name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/legal representative id/i)).toBeInTheDocument();
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

describe('SellerRegisterForm verification', () => {
  it('renders business model and document uploads from the Alloy step 3 layout', () => {
    render(<SellerRegisterForm page={getSellerPage()} initialStep="verification" />);

    expect(screen.getByRole('heading', { name: 'Verification' })).toBeInTheDocument();
    expect(
      screen.getByText(
        /to ensure a safe and trustworthy marketplace, we need some additional information and documents/i,
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Business model' })).toBeInTheDocument();
    expect(screen.getByText('Regular retail')).toBeInTheDocument();
    expect(screen.getByText('Official Store / Mall')).toBeInTheDocument();
    expect(screen.getByText('Manufacturer')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Origin and authorization documents' })).toBeInTheDocument();
    expect(
      screen.getByText(/please upload any supporting documents you have/i),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/brand distribution authorization/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/product quality \/ food safety certificate/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/import invoice \/ origin document/i)).toBeInTheDocument();
    expect(screen.getAllByText('Click to upload or drag and drop')).toHaveLength(3);
    expect(screen.getAllByText('PDF, JPG, PNG (max 5MB)')).toHaveLength(3);
    expect(screen.getByText('Your information is secure')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next Step' })).toBeEnabled();
  });

  it('keeps the user on verification when no business model is selected', async () => {
    const user = userEvent.setup();
    render(<SellerRegisterForm page={getSellerPage()} initialStep="verification" />);

    await user.click(screen.getByRole('button', { name: 'Next Step' }));

    expect(await screen.findByText('Business model is required')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Verification' })).toBeInTheDocument();
  });

  it('advances to terms after a business model is selected', async () => {
    const user = userEvent.setup();
    render(<SellerRegisterForm page={getSellerPage()} initialStep="verification" />);

    await user.click(screen.getByText('Regular retail'));
    await user.click(screen.getByRole('button', { name: 'Next Step' }));

    expect(await screen.findByRole('heading', { name: 'Terms and Conditions' })).toBeInTheDocument();
  });

  it('returns to shop details from verification', async () => {
    const user = userEvent.setup();
    render(<SellerRegisterForm page={getSellerPage()} initialStep="verification" />);

    await user.click(screen.getByRole('button', { name: 'Back' }));

    expect(await screen.findByRole('heading', { name: 'Shop Details' })).toBeInTheDocument();
  });
});

describe('SellerRegisterForm terms', () => {
  it('renders the terms document and agreement checkbox', () => {
    render(<SellerRegisterForm page={getSellerPage()} initialStep="terms" />);

    expect(screen.getByRole('heading', { name: 'Terms and Conditions' })).toBeInTheDocument();
    expect(screen.getByRole('article', { name: 'Seller terms and conditions' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '1. General Terms' })).toBeInTheDocument();
    expect(screen.getByText(/acceptance of terms/i)).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: '9. Limitation of Liability & Dispute Resolution' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/terms and conditions and privacy policy/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Complete Registration' })).toBeInTheDocument();
  });

  it('keeps the user on terms when agreements are not accepted', async () => {
    const user = userEvent.setup();
    render(<SellerRegisterForm page={getSellerPage()} initialStep="terms" />);

    await user.click(screen.getByRole('button', { name: 'Complete Registration' }));

    expect(await screen.findByText('You must accept the Terms of Service')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Terms and Conditions' })).toBeInTheDocument();
  });

  it('returns to verification from terms', async () => {
    const user = userEvent.setup();
    render(<SellerRegisterForm page={getSellerPage()} initialStep="terms" />);

    await user.click(screen.getByRole('button', { name: 'Back' }));

    expect(await screen.findByRole('heading', { name: 'Verification' })).toBeInTheDocument();
  });

  it('advances to complete after the seller terms are accepted', async () => {
    const user = userEvent.setup();
    render(<SellerRegisterForm page={getSellerPage()} initialStep="terms" />);

    await user.click(screen.getByLabelText(/terms and conditions and privacy policy/i));
    await user.click(screen.getByRole('button', { name: 'Complete Registration' }));

    expect(
      await screen.findByRole('heading', { name: 'Your Registration is Complete!' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Waiting for Approval')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'What happens next?' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to Home' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Go to Seller Center' })).toHaveAttribute(
      'href',
      '/seller',
    );
  });
});

describe('SellerRegisterForm complete', () => {
  it('renders the Alloy completion summary', () => {
    render(<SellerRegisterForm page={getSellerPage()} initialStep="complete" />);

    expect(
      screen.getByRole('heading', { name: 'Your Registration is Complete!' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/youremail@example.com/i)).toBeInTheDocument();
    expect(screen.getByText('Review Information')).toBeInTheDocument();
    expect(screen.getByText('Account Approval')).toBeInTheDocument();
    expect(screen.getByText('Set Up Store')).toBeInTheDocument();
    expect(screen.getByText('Start Selling')).toBeInTheDocument();
  });
});

