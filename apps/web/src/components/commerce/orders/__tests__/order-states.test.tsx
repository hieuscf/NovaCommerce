import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from '@novacommerce/ui/components/button';
import OrdersError from '@/app/(store)/orders/error';
import OrderDetailError from '@/app/(store)/orders/[orderNumber]/error';
import { OrderErrorState } from '../order-states';

describe('OrderErrorState', () => {
  it('does not surface internal error details', () => {
    render(
      <OrderErrorState
        action={
          <Button type="button" onClick={() => undefined}>
            Try again
          </Button>
        }
      />,
    );

    expect(screen.queryByText(/ECONNREFUSED|digest/i)).not.toBeInTheDocument();
  });
});

describe('OrdersError', () => {
  it('retries without exposing internal error details', async () => {
    const reset = vi.fn();
    const error = Object.assign(new Error('connect ECONNREFUSED 127.0.0.1:6379'), {
      digest: 'orders-digest',
    });

    render(<OrdersError error={error} reset={reset} />);

    expect(screen.getByRole('heading', { name: 'Could not load your orders' })).toBeInTheDocument();
    expect(screen.queryByText(/ECONNREFUSED|orders-digest/i)).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(reset).toHaveBeenCalledOnce();
  });
});

describe('OrderDetailError', () => {
  it('retries a detail load failure', async () => {
    const reset = vi.fn();
    render(
      <OrderDetailError
        error={Object.assign(new Error('boom'), { digest: 'order-detail-digest' })}
        reset={reset}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Something went wrong' })).toBeInTheDocument();
    expect(screen.queryByText(/boom|order-detail-digest/i)).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(reset).toHaveBeenCalledOnce();
  });
});
