import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '../badge';
import { expectNoA11yViolations } from '../../test/a11y';

describe('Badge', () => {
  it('renders its content', () => {
    render(<Badge>Best Seller</Badge>);

    expect(screen.getByText('Best Seller')).toBeInTheDocument();
  });

  it.each([
    'default',
    'secondary',
    'outline',
    'success',
    'warning',
    'destructive',
    'info',
    'promo',
    'bestseller',
    'sale',
  ] as const)('renders the %s variant', (variant) => {
    render(<Badge variant={variant}>-20%</Badge>);

    expect(screen.getByText('-20%')).toBeInTheDocument();
  });

  it('renders as the composed child element when asChild is set', () => {
    render(
      <Badge asChild>
        <a href="/deals">On sale</a>
      </Badge>,
    );

    expect(screen.getByRole('link', { name: 'On sale' })).toHaveAttribute('href', '/deals');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Badge variant="sale">-20%</Badge>);

    await expectNoA11yViolations(container);
  });
});
