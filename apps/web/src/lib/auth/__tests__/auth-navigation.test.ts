import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { redirectToLogin, redirectToUnauthorized, resetAuthNavigate, setAuthNavigate } from '../auth-navigation';

describe('auth navigation', () => {
  const navigate = vi.fn();

  beforeEach(() => {
    navigate.mockClear();
    setAuthNavigate(navigate);
  });

  afterEach(() => {
    resetAuthNavigate();
  });

  it('does not redirect away from auth surfaces', () => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { pathname: '/login', search: '', assign: vi.fn() },
    });
    redirectToLogin('session-expired');
    expect(navigate).not.toHaveBeenCalled();
  });

  it('does not loop on /unauthorized', () => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { pathname: '/unauthorized', search: '', assign: vi.fn() },
    });
    redirectToUnauthorized();
    expect(navigate).not.toHaveBeenCalled();
  });
});
