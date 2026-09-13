import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  getPaginationRange,
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../pagination';
import { expectNoA11yViolations } from '../../test/a11y';

function ProductPagination({ page = 2, totalPages = 10 }: { page?: number; totalPages?: number }) {
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href={`?page=${page - 1}`} disabled={page === 1} />
        </PaginationItem>
        {getPaginationRange({ page, totalPages }).map((item, index) => (
          <PaginationItem key={`${item}-${index}`}>
            {item === 'ellipsis' ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink href={`?page=${item}`} isActive={item === page}>
                {item}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext href={`?page=${page + 1}`} disabled={page === totalPages} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

describe('getPaginationRange', () => {
  it('returns an empty list when there are no pages', () => {
    expect(getPaginationRange({ page: 1, totalPages: 0 })).toEqual([]);
  });

  it('lists every page when they all fit', () => {
    expect(getPaginationRange({ page: 1, totalPages: 5 })).toEqual([1, 2, 3, 4, 5]);
  });

  it('adds a trailing ellipsis near the start', () => {
    expect(getPaginationRange({ page: 2, totalPages: 10 })).toEqual([
      1,
      2,
      3,
      4,
      5,
      'ellipsis',
      10,
    ]);
  });

  it('adds ellipses on both sides in the middle', () => {
    expect(getPaginationRange({ page: 5, totalPages: 10 })).toEqual([
      1,
      'ellipsis',
      4,
      5,
      6,
      'ellipsis',
      10,
    ]);
  });

  it('adds a leading ellipsis near the end', () => {
    expect(getPaginationRange({ page: 10, totalPages: 10 })).toEqual([
      1,
      'ellipsis',
      6,
      7,
      8,
      9,
      10,
    ]);
  });

  it('keeps a constant length so the control does not change width', () => {
    const lengths = Array.from({ length: 20 }, (_, index) =>
      getPaginationRange({ page: index + 1, totalPages: 20 }).length,
    );

    expect(new Set(lengths)).toEqual(new Set([7]));
  });

  it('clamps an out-of-range page', () => {
    expect(getPaginationRange({ page: 99, totalPages: 10 })).toEqual(
      getPaginationRange({ page: 10, totalPages: 10 }),
    );
  });

  it('always includes the first and last page', () => {
    const range = getPaginationRange({ page: 6, totalPages: 20 });

    expect(range[0]).toBe(1);
    expect(range.at(-1)).toBe(20);
  });
});

describe('Pagination', () => {
  it('renders a labelled navigation landmark', () => {
    render(<ProductPagination />);

    expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeInTheDocument();
  });

  it('marks the active page with aria-current', () => {
    render(<ProductPagination page={2} />);

    expect(screen.getByRole('link', { name: '2' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: '1' })).not.toHaveAttribute('aria-current');
  });

  it('exposes accessible previous and next controls', () => {
    render(<ProductPagination />);

    expect(screen.getByRole('link', { name: 'Previous' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Next' })).toBeInTheDocument();
  });

  it('disables previous on the first page and next on the last', () => {
    const { unmount } = render(<ProductPagination page={1} totalPages={10} />);
    expect(screen.getByRole('link', { name: 'Previous' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    unmount();

    render(<ProductPagination page={10} totalPages={10} />);
    expect(screen.getByRole('link', { name: 'Next' })).toHaveAttribute('aria-disabled', 'true');
  });

  it('exposes page links as URLs so page state can live in the address bar', () => {
    render(<ProductPagination page={2} />);

    expect(screen.getByRole('link', { name: '3' })).toHaveAttribute('href', '?page=3');
  });

  it('supports click handlers for non-URL page state', async () => {
    const onClick = vi.fn();
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink onClick={onClick}>1</PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );

    await userEvent.click(screen.getByText('1'));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it('hides the ellipsis from assistive technology', () => {
    render(<ProductPagination page={5} />);

    expect(screen.getByRole('navigation').querySelector('[data-slot="pagination-ellipsis"]'))
      .toHaveAttribute('aria-hidden', 'true');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<ProductPagination page={5} />);

    await expectNoA11yViolations(container);
  });
});
