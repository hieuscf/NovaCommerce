import userEvent from '@testing-library/user-event';

/**
 * user-event instance for Radix popper layers (Select, DropdownMenu).
 *
 * Those primitives mark sibling nodes `aria-hidden` and inject a scroll-lock
 * stylesheet while open. user-event's default `pointer-events` check then
 * calls `getComputedStyle` for every ancestor of every pointer event, which is
 * pathologically slow under jsdom. Disabling the check keeps these suites fast
 * without changing what is being asserted.
 */
export function createUser() {
  return userEvent.setup({ pointerEventsCheck: 0 });
}
