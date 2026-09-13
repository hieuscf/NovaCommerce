import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Alert, AlertActions, AlertContent, AlertDescription, AlertTitle } from '../alert';
import { Button } from '../button';
import { expectNoA11yViolations } from '../../test/a11y';

describe('Alert', () => {
  it('renders its title and description', () => {
    render(
      <Alert>
        <AlertContent>
          <AlertTitle>Payment pending</AlertTitle>
          <AlertDescription>We are waiting for the provider to confirm.</AlertDescription>
        </AlertContent>
      </Alert>,
    );

    expect(screen.getByText('Payment pending')).toBeInTheDocument();
    expect(screen.getByText('We are waiting for the provider to confirm.')).toBeInTheDocument();
  });

  it('announces urgent variants assertively', () => {
    render(
      <Alert variant="destructive">
        <AlertContent>
          <AlertTitle>Payment failed</AlertTitle>
        </AlertContent>
      </Alert>,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Payment failed');
  });

  it('announces informational variants politely', () => {
    render(
      <Alert variant="info">
        <AlertContent>
          <AlertTitle>Shipping update</AlertTitle>
        </AlertContent>
      </Alert>,
    );

    expect(screen.getByRole('status')).toHaveTextContent('Shipping update');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it.each(['default', 'info', 'success', 'warning', 'destructive'] as const)(
    'renders the %s variant',
    (variant) => {
      render(
        <Alert variant={variant}>
          <AlertContent>
            <AlertTitle>Notice</AlertTitle>
          </AlertContent>
        </Alert>,
      );

      expect(screen.getByText('Notice')).toBeInTheDocument();
    },
  );

  it('renders an action', () => {
    render(
      <Alert variant="warning">
        <AlertContent>
          <AlertTitle>Low stock</AlertTitle>
          <AlertActions>
            <Button size="sm">Restock</Button>
          </AlertActions>
        </AlertContent>
      </Alert>,
    );

    expect(screen.getByRole('button', { name: 'Restock' })).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Alert variant="success">
        <AlertContent>
          <AlertTitle>Order placed</AlertTitle>
          <AlertDescription>A confirmation email is on its way.</AlertDescription>
        </AlertContent>
      </Alert>,
    );

    await expectNoA11yViolations(container);
  });
});
