import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../dialog';
import { Button } from '../button';
import { expectNoA11yViolations } from '../../test/a11y';

function ConfirmDialog(props: React.ComponentProps<typeof DialogContent> = {}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Delete product</Button>
      </DialogTrigger>
      <DialogContent {...props}>
        <DialogHeader>
          <DialogTitle>Delete this product?</DialogTitle>
          <DialogDescription>This action cannot be undone.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
          <Button variant="destructive">Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

describe('Dialog', () => {
  it('is closed until the trigger is activated', async () => {
    render(<ConfirmDialog />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Delete product' }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('exposes its title and description as the accessible name and description', async () => {
    render(<ConfirmDialog />);

    await userEvent.click(screen.getByRole('button', { name: 'Delete product' }));

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAccessibleName('Delete this product?');
    expect(dialog).toHaveAccessibleDescription('This action cannot be undone.');
  });

  it('moves focus into the dialog when opened', async () => {
    render(<ConfirmDialog />);

    await userEvent.click(screen.getByRole('button', { name: 'Delete product' }));

    expect(screen.getByRole('dialog')).toContainElement(
      document.activeElement as HTMLElement,
    );
  });

  it('closes on Escape', async () => {
    render(<ConfirmDialog />);

    await userEvent.click(screen.getByRole('button', { name: 'Delete product' }));
    await userEvent.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes via the built-in close button', async () => {
    render(<ConfirmDialog />);

    await userEvent.click(screen.getByRole('button', { name: 'Delete product' }));
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes via a composed DialogClose', async () => {
    render(<ConfirmDialog />);

    await userEvent.click(screen.getByRole('button', { name: 'Delete product' }));
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('omits the close button when hideCloseButton is set', async () => {
    render(<ConfirmDialog hideCloseButton />);

    await userEvent.click(screen.getByRole('button', { name: 'Delete product' }));

    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();
  });

  it('returns focus to the trigger after closing', async () => {
    render(<ConfirmDialog />);

    const trigger = screen.getByRole('button', { name: 'Delete product' });
    await userEvent.click(trigger);
    await userEvent.keyboard('{Escape}');

    expect(trigger).toHaveFocus();
  });

  it('has no accessibility violations when open', async () => {
    const { baseElement } = render(<ConfirmDialog />);

    await userEvent.click(screen.getByRole('button', { name: 'Delete product' }));

    await expectNoA11yViolations(baseElement as HTMLElement);
  });
});
