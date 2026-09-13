import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from '../table';
import { expectNoA11yViolations } from '../../test/a11y';

function OrdersTable(props: React.ComponentProps<typeof Table> = {}) {
  return (
    <Table {...props}>
      <TableCaption>Recent orders</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Order</TableHead>
          <TableHead>Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>NC-1001</TableCell>
          <TableCell>$129.00</TableCell>
        </TableRow>
        <TableRow data-state="selected">
          <TableCell>NC-1002</TableCell>
          <TableCell>$89.00</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}

describe('Table', () => {
  it('renders a semantic table with headers and cells', () => {
    render(<OrdersTable />);

    expect(screen.getByRole('table', { name: 'Recent orders' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Order' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'NC-1001' })).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(3);
  });

  it('exposes column headers with a scope for screen readers', () => {
    render(<OrdersTable />);

    expect(screen.getByRole('columnheader', { name: 'Total' })).toHaveAttribute(
      'scope',
      'col',
    );
  });

  it('marks a selected row', () => {
    render(<OrdersTable />);

    const selected = screen.getByRole('cell', { name: 'NC-1002' }).closest('tr');

    expect(selected).toHaveAttribute('data-state', 'selected');
  });

  it.each(['comfortable', 'dense'] as const)('applies %s density', (density) => {
    render(<OrdersTable density={density} />);

    expect(screen.getByRole('table')).toHaveAttribute('data-density', density);
  });

  it('renders an empty row spanning the table', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order</TableHead>
            <TableHead>Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableEmpty colSpan={2}>No orders yet</TableEmpty>
        </TableBody>
      </Table>,
    );

    const cell = screen.getByRole('cell', { name: 'No orders yet' });

    expect(cell).toHaveAttribute('colspan', '2');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<OrdersTable />);

    await expectNoA11yViolations(container);
  });
});
