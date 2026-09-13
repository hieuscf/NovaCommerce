import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../tabs';
import { expectNoA11yViolations } from '../../test/a11y';

function ProductTabs() {
  return (
    <Tabs defaultValue="bestsellers">
      <TabsList aria-label="Product collections">
        <TabsTrigger value="bestsellers">Best Sellers</TabsTrigger>
        <TabsTrigger value="new">New Arrivals</TabsTrigger>
        <TabsTrigger value="sale" disabled>
          On Sale
        </TabsTrigger>
      </TabsList>
      <TabsContent value="bestsellers">Bestselling products</TabsContent>
      <TabsContent value="new">Newly added products</TabsContent>
      <TabsContent value="sale">Discounted products</TabsContent>
    </Tabs>
  );
}

describe('Tabs', () => {
  it('renders a tablist and shows only the active panel', () => {
    render(<ProductTabs />);

    expect(screen.getByRole('tablist', { name: 'Product collections' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Best Sellers' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByText('Bestselling products')).toBeInTheDocument();
    expect(screen.queryByText('Newly added products')).not.toBeInTheDocument();
  });

  it('switches panels on click', async () => {
    render(<ProductTabs />);

    await userEvent.click(screen.getByRole('tab', { name: 'New Arrivals' }));

    expect(screen.getByRole('tab', { name: 'New Arrivals' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByText('Newly added products')).toBeInTheDocument();
  });

  it('switches panels with arrow keys', async () => {
    render(<ProductTabs />);

    await userEvent.tab();
    expect(screen.getByRole('tab', { name: 'Best Sellers' })).toHaveFocus();

    await userEvent.keyboard('{ArrowRight}');

    expect(screen.getByRole('tab', { name: 'New Arrivals' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('does not activate a disabled tab', async () => {
    render(<ProductTabs />);

    await userEvent.click(screen.getByRole('tab', { name: 'On Sale' }));

    expect(screen.getByRole('tab', { name: 'On Sale' })).toHaveAttribute(
      'aria-selected',
      'false',
    );
    expect(screen.queryByText('Discounted products')).not.toBeInTheDocument();
  });

  it('links each tab to its panel', () => {
    render(<ProductTabs />);

    const tab = screen.getByRole('tab', { name: 'Best Sellers' });
    const panel = screen.getByRole('tabpanel');

    expect(tab).toHaveAttribute('aria-controls', panel.id);
    expect(panel).toHaveAttribute('aria-labelledby', tab.id);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<ProductTabs />);

    await expectNoA11yViolations(container);
  });
});
