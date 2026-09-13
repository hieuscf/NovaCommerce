import * as React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { LoginForm } from '../login-form';
import { resetApiClient } from '@/lib/api/client';
import { authSession, resetAuthSession } from '@/lib/auth/session';

const pushMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => new URLSearchParams(),
}));

function mockFetch(response: unknown, ok = true, status = 200) {
  global.fetch = vi.fn().mockResolvedValue({
    ok,
    status,
    statusText: ok ? 'OK' : 'Unauthorized',
    json: async () => response,
  } as Response);
}

describe('LoginForm', () => {
  beforeEach(() => {
    pushMock.mockClear();
    resetAuthSession();
    resetApiClient();
  });

  it('renders email and password fields', () => {
    render(<LoginForm />);

    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continue with google/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /continue with apple/i })).toBeDisabled();
  });

  it('shows validation errors for empty fields', async () => {
    render(<LoginForm />);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });
  });

  it('shows error for invalid email format', async () => {
    render(<LoginForm />);

    await userEvent.type(screen.getByLabelText(/email address/i), 'not-an-email');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });
  });

  it('submits credentials, stores tokens, and redirects on success', async () => {
    mockFetch({
      data: {
        accessToken: 'access-token',
        tokenType: 'Bearer',
        expiresIn: 900,
        refreshToken: 'refresh-token',
      },
      meta: { requestId: 'req-1' },
    });

    render(<LoginForm />);

    await userEvent.type(screen.getByLabelText(/email address/i), 'user@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'SecurePass123!');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(authSession.getAccessToken()).toBe('access-token');
      expect(pushMock).toHaveBeenCalledWith('/');
      expect(screen.getByText(/signed in/i)).toBeInTheDocument();
    });
  });

  it('displays user-friendly message for invalid credentials', async () => {
    mockFetch(
      {
        error: {
          code: 'UNAUTHENTICATED',
          message: 'Invalid credentials',
          requestId: 'req-2',
        },
      },
      false,
      401,
    );

    render(<LoginForm />);

    await userEvent.type(screen.getByLabelText(/email address/i), 'user@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'WrongPass');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/unable to sign in/i)).toBeInTheDocument();
      expect(screen.getByText(/email or password is incorrect/i)).toBeInTheDocument();
    });
  });

  it('disables submit and announces loading while signing in', async () => {
    let resolveRequest: (value: Response) => void = () => undefined;
    let loginStarted = false;
    global.fetch = vi.fn().mockImplementation((input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/api/auth/session')) {
        return Promise.resolve({ ok: true, status: 204 } as Response);
      }
      if (loginStarted) {
        return Promise.resolve({ ok: true, status: 204 } as Response);
      }
      loginStarted = true;
      return new Promise<Response>((resolve) => {
        resolveRequest = resolve;
      });
    });

    render(<LoginForm />);

    await userEvent.type(screen.getByLabelText(/email address/i), 'user@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'SecurePass123!');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    const submit = screen.getByRole('button', { name: /signing in/i });
    expect(submit).toBeDisabled();
    expect(screen.getByLabelText(/email address/i)).toHaveValue('user@example.com');

    resolveRequest({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({
        data: {
          accessToken: 'access-token',
          tokenType: 'Bearer',
          expiresIn: 900,
          refreshToken: 'refresh-token',
        },
        meta: { requestId: 'req-3' },
      }),
    } as Response);

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/');
    });
  });
});
