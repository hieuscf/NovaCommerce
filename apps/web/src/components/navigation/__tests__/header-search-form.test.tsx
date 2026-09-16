import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HeaderSearchForm } from '../header-search-form';

const push = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

describe('HeaderSearchForm', () => {
  beforeEach(() => {
    push.mockReset();
  });

  it('navigates to /shop with the typed keyword', async () => {
    const user = userEvent.setup();
    render(<HeaderSearchForm placeholder="Search products..." />);

    const input = screen.getByRole('searchbox', { name: 'Search products' });
    await user.type(input, 'headphones');
    fireEvent.submit(screen.getByRole('search'));

    expect(push).toHaveBeenCalledWith('/shop?q=headphones');
  });

  it('navigates to /shop when the keyword is empty', () => {
    render(<HeaderSearchForm placeholder="Search products..." />);
    fireEvent.submit(screen.getByRole('search'));
    expect(push).toHaveBeenCalledWith('/shop');
  });
});
