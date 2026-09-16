import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { SellerPage } from '../seller-page';
import { getSellerPage } from '@/lib/seller/get-seller-page';

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
    expect(screen.getByLabelText(/tax id/i)).toBeInTheDocument();
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
    expect(screen.queryByRole('heading', { name: 'Set up your shop' })).not.toBeInTheDocument();
  });

  it('renders the registered workspace instead of the application form', () => {
    render(<SellerPage page={getSellerPage('registered')} />);

    expect(screen.getByRole('heading', { name: 'Your seller workspace' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Become a Seller' })).not.toBeInTheDocument();
  });
});
