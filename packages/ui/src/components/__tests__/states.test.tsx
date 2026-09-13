import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PackageIcon, TriangleAlertIcon } from 'lucide-react';
import { EmptyState } from '../empty-state';
import { ErrorState } from '../error-state';
import { LoadingState } from '../loading-state';
import { Skeleton, SkeletonText } from '../skeleton';
import { Spinner } from '../spinner';
import { Button } from '../button';
import { expectNoA11yViolations } from '../../test/a11y';

describe('EmptyState', () => {
  it('renders a heading, description and action', () => {
    render(
      <EmptyState
        icon={<PackageIcon />}
        title="No products yet"
        description="Add your first product to get started."
        action={<Button>Add product</Button>}
      />,
    );

    expect(screen.getByRole('heading', { name: 'No products yet' })).toBeInTheDocument();
    expect(screen.getByText('Add your first product to get started.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add product' })).toBeInTheDocument();
  });

  it('is not announced as an error', () => {
    render(<EmptyState title="No products yet" />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <EmptyState icon={<PackageIcon />} title="No products yet" description="Nothing here." />,
    );

    await expectNoA11yViolations(container);
  });
});

describe('ErrorState', () => {
  it('announces itself and renders a retry action', async () => {
    const onRetry = vi.fn();
    render(
      <ErrorState
        icon={<TriangleAlertIcon />}
        title="Could not load products"
        description="Check your connection and try again."
        action={<Button onClick={onRetry}>Try again</Button>}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Could not load products');

    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('renders an optional secondary action', () => {
    render(
      <ErrorState
        title="Could not load products"
        action={<Button>Try again</Button>}
        secondaryAction={<Button variant="ghost">Contact support</Button>}
      />,
    );

    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Contact support' })).toBeInTheDocument();
  });

  it.each(['danger', 'neutral'] as const)('renders the %s tone', (tone) => {
    render(<ErrorState tone={tone} title="Something went wrong" />);

    expect(screen.getByRole('heading', { name: 'Something went wrong' })).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <ErrorState
        icon={<TriangleAlertIcon />}
        title="Could not load products"
        description="Try again shortly."
        action={<Button>Try again</Button>}
      />,
    );

    await expectNoA11yViolations(container);
  });
});

describe('LoadingState', () => {
  it('announces the loading status politely', () => {
    render(<LoadingState label="Loading products" />);

    const status = screen.getByRole('status');

    expect(status).toHaveTextContent('Loading products');
    expect(status).toHaveAttribute('aria-live', 'polite');
  });

  it.each(['inline', 'section', 'page'] as const)('renders the %s variant', (variant) => {
    render(<LoadingState variant={variant} label="Loading" />);

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<LoadingState label="Loading products" />);

    await expectNoA11yViolations(container);
  });
});

describe('Spinner', () => {
  it('is hidden from assistive technology without a label', () => {
    const { container } = render(<Spinner />);

    expect(container.querySelector('[data-slot="spinner"]')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  });

  it('is announced when given a label', () => {
    render(<Spinner label="Loading" />);

    expect(screen.getByRole('status')).toHaveTextContent('Loading');
  });
});

describe('Skeleton', () => {
  it('is hidden from assistive technology', () => {
    const { container } = render(<Skeleton className="h-40" />);

    expect(container.querySelector('[data-slot="skeleton"]')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  });

  it.each(['block', 'text', 'circle'] as const)('renders the %s variant', (variant) => {
    const { container } = render(<Skeleton variant={variant} />);

    expect(container.querySelector('[data-slot="skeleton"]')).toBeInTheDocument();
  });

  it('renders the requested number of text lines', () => {
    const { container } = render(<SkeletonText lines={4} />);

    expect(container.querySelectorAll('[data-slot="skeleton"]')).toHaveLength(4);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<SkeletonText lines={3} />);

    await expectNoA11yViolations(container);
  });
});
