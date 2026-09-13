import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../button';
import { expectNoA11yViolations } from '../../test/a11y';

describe('Button', () => {
  it('renders an accessible button with its label', () => {
    render(<Button>Add to cart</Button>);

    expect(screen.getByRole('button', { name: 'Add to cart' })).toBeInTheDocument();
  });

  it('calls onClick when activated', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Checkout</Button>);

    await userEvent.click(screen.getByRole('button', { name: 'Checkout' }));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it('is reachable and activatable by keyboard', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Submit</Button>);

    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Submit' })).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('does not fire onClick when disabled', async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Submit
      </Button>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));

    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
    expect(onClick).not.toHaveBeenCalled();
  });

  it('blocks interaction and announces a busy state while loading', async () => {
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Save
      </Button>,
    );

    const button = screen.getByRole('button');

    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toBeDisabled();
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('exposes the loading label to assistive technology', () => {
    render(<Button loading loadingLabel="Saving changes" />);

    expect(screen.getByRole('button', { name: 'Saving changes' })).toBeInTheDocument();
  });

  it.each([
    'default',
    'primary-gradient',
    'secondary',
    'soft',
    'outline',
    'ghost',
    'destructive',
    'link',
    'dark',
  ] as const)('renders the %s variant', (variant) => {
    render(<Button variant={variant}>Action</Button>);

    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
  });

  it.each(['default', 'sm', 'lg', 'icon', 'icon-sm'] as const)(
    'renders the %s size',
    (size) => {
      render(<Button size={size}>Action</Button>);

      expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
    },
  );

  it('renders as the composed child element when asChild is set', () => {
    render(
      <Button asChild>
        <a href="/shop">Shop now</a>
      </Button>,
    );

    expect(screen.getByRole('link', { name: 'Shop now' })).toHaveAttribute('href', '/shop');
  });

  it('marks a composed child as aria-disabled instead of using the disabled attribute', () => {
    render(
      <Button asChild disabled>
        <a href="/shop">Shop now</a>
      </Button>,
    );

    expect(screen.getByRole('link', { name: 'Shop now' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Button>Add to cart</Button>);

    await expectNoA11yViolations(container);
  });
});
