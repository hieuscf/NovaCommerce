import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { NovaCommerceLogo } from '../nova-commerce-logo';
import { expectNoA11yViolations } from '../../test/a11y';

describe('NovaCommerceLogo', () => {
  it('renders the wordmark by default', () => {
    render(<NovaCommerceLogo />);

    expect(screen.getByText('NovaCommerce')).toBeInTheDocument();
  });

  it('exposes an accessible name when icon-only', () => {
    render(<NovaCommerceLogo iconOnly />);

    expect(screen.getByLabelText('NovaCommerce logo')).toBeInTheDocument();
    expect(screen.queryByText('NovaCommerce')).not.toBeInTheDocument();
  });

  it('renders the footer tagline next to the mark', () => {
    render(<NovaCommerceLogo subLabel="More than just shopping. It's a better experience." />);

    expect(
      screen.getByText("More than just shopping. It's a better experience."),
    ).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<NovaCommerceLogo />);

    await expectNoA11yViolations(container);
  });
});
