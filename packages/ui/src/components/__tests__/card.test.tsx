import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../card';
import { Button } from '../button';
import { expectNoA11yViolations } from '../../test/a11y';

describe('Card', () => {
  it('renders all composed sections', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Revenue</CardTitle>
          <CardDescription>Last 30 days</CardDescription>
        </CardHeader>
        <CardContent>$48,200</CardContent>
        <CardFooter>
          <Button size="sm">View report</Button>
        </CardFooter>
      </Card>,
    );

    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('Last 30 days')).toBeInTheDocument();
    expect(screen.getByText('$48,200')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'View report' })).toBeInTheDocument();
  });

  it('forwards arbitrary props to the root element', () => {
    render(
      <Card aria-label="Revenue summary">
        <CardContent>$48,200</CardContent>
      </Card>,
    );

    expect(screen.getByLabelText('Revenue summary')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Card>
        <CardHeader>
          <CardTitle>Revenue</CardTitle>
        </CardHeader>
        <CardContent>$48,200</CardContent>
      </Card>,
    );

    await expectNoA11yViolations(container);
  });
});
