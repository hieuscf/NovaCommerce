import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../dropdown-menu';
import { Button } from '../button';
import { openPopper, useSynchronousCleanup } from '../../test/popper';

function AccountMenu({ onSignOut = vi.fn() }: { onSignOut?: () => void } = {}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost">Account</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>My account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Orders</DropdownMenuItem>
        <DropdownMenuItem disabled>Rewards</DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onSelect={onSignOut}>
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

describe('DropdownMenu', () => {
  useSynchronousCleanup();

  it('is closed until the trigger is activated', () => {
    render(<AccountMenu />);

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();

    openPopper(screen.getByRole('button', { name: 'Account' }));

    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('renders its items as menu items', () => {
    render(<AccountMenu />);

    openPopper(screen.getByRole('button', { name: 'Account' }));

    expect(screen.getByRole('menuitem', { name: 'Orders' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Sign out' })).toBeInTheDocument();
  });

  it('opens with the keyboard', () => {
    render(<AccountMenu />);

    fireEvent.keyDown(screen.getByRole('button', { name: 'Account' }), { key: 'Enter' });

    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('focuses the first enabled item on ArrowDown', () => {
    render(<AccountMenu />);

    openPopper(screen.getByRole('button', { name: 'Account' }));
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'ArrowDown' });

    expect(screen.getByRole('menuitem', { name: 'Orders' })).toHaveFocus();
  });

  it('invokes the selected item handler', () => {
    const onSignOut = vi.fn();
    render(<AccountMenu onSignOut={onSignOut} />);

    openPopper(screen.getByRole('button', { name: 'Account' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Sign out' }));

    expect(onSignOut).toHaveBeenCalledOnce();
  });

  it('marks disabled items as disabled', () => {
    render(<AccountMenu />);

    openPopper(screen.getByRole('button', { name: 'Account' }));

    expect(screen.getByRole('menuitem', { name: 'Rewards' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });

  it('closes on Escape', () => {
    render(<AccountMenu />);

    openPopper(screen.getByRole('button', { name: 'Account' }));
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' });

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('distinguishes destructive items for styling hooks', () => {
    render(<AccountMenu />);

    openPopper(screen.getByRole('button', { name: 'Account' }));

    expect(screen.getByRole('menuitem', { name: 'Sign out' })).toHaveAttribute(
      'data-variant',
      'destructive',
    );
  });
});
