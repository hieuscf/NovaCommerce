import { describe, expect, it } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toaster, toast } from '../toast';

describe('Toaster', () => {
  it('renders a live region so toasts are announced', () => {
    render(<Toaster />);

    expect(screen.getByRole('region', { name: /notifications/i })).toBeInTheDocument();
  });

  it('shows a toast with its title', async () => {
    render(<Toaster />);

    act(() => {
      toast('Added to cart');
    });

    expect(await screen.findByText('Added to cart')).toBeInTheDocument();
  });

  it('shows a description alongside the title', async () => {
    render(<Toaster />);

    act(() => {
      toast.success('Order placed', { description: 'Confirmation sent to your inbox' });
    });

    expect(await screen.findByText('Order placed')).toBeInTheDocument();
    expect(await screen.findByText('Confirmation sent to your inbox')).toBeInTheDocument();
  });

  it.each(['success', 'info', 'warning', 'error'] as const)(
    'supports the %s variant',
    async (variant) => {
      render(<Toaster />);

      act(() => {
        toast[variant](`${variant} message`);
      });

      expect(await screen.findByText(`${variant} message`)).toBeInTheDocument();
    },
  );

  it('renders an action the user can invoke', async () => {
    let clicked = false;
    render(<Toaster />);

    act(() => {
      toast('Item removed', {
        action: {
          label: 'Undo',
          onClick: () => {
            clicked = true;
          },
        },
      });
    });

    await userEvent.click(await screen.findByRole('button', { name: 'Undo' }));

    expect(clicked).toBe(true);
  });

  it('dismisses a toast programmatically', async () => {
    render(<Toaster />);

    let id: string | number = '';
    act(() => {
      id = toast('Temporary message');
    });

    expect(await screen.findByText('Temporary message')).toBeInTheDocument();

    act(() => {
      toast.dismiss(id);
    });

    await waitFor(() => {
      expect(screen.queryByText('Temporary message')).not.toBeInTheDocument();
    });
  });
});
