import { cleanup, fireEvent } from '@testing-library/react';
import { afterEach } from 'vitest';

/**
 * Helpers for Radix popper-backed primitives (Select, DropdownMenu).
 *
 * Under jsdom these primitives are incompatible with React Testing Library's
 * asynchronous helpers: once a popper layer is mounted, anything routed
 * through the async `act` wrapper — `userEvent`, `waitFor`, `findBy*` and
 * RTL's own auto-cleanup — either stalls for tens of seconds or never
 * settles. Driving them with synchronous `fireEvent` and asserting
 * synchronously keeps the behaviour under test identical while running in
 * milliseconds. Overlay primitives that do not use the popper (Dialog, Sheet)
 * work normally with `userEvent`.
 */

/** Opens a popper trigger. Radix opens these on `pointerdown`, not `click`. */
export function openPopper(trigger: HTMLElement): void {
  fireEvent.pointerDown(trigger, { button: 0, ctrlKey: false, pointerType: 'mouse' });
}

/**
 * Unmounts synchronously before RTL's auto-cleanup can take the slow async
 * path. Vitest runs `afterEach` hooks in reverse registration order, so this
 * runs first and leaves the automatic hook with nothing to do.
 */
export function useSynchronousCleanup(): void {
  afterEach(() => {
    cleanup();
  });
}
