import * as React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { RegisterForm } from '../register-form';
import { resetApiClient } from '@/lib/api/client';

const pushMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => new URLSearchParams(),
}));

function mockFetch(response: unknown, ok = true, status = 200) {
  global.fetch = vi.fn().mockResolvedValue({
    ok,
    status,
    statusText: ok ? 'Created' : 'Conflict',
    json: async () => response,
  } as Response);
}

describe('RegisterForm', () => {
  beforeEach(() => {
    pushMock.mockClear();
    resetApiClient();
  });

  it('renders all required fields', () => {
    render(<RegisterForm />);

    expect(screen.getByLabelText('First name')).toBeInTheDocument();
    expect(screen.getByLabelText('Last name')).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByText('Password requirements')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm password')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Create Account' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /terms of service/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continue with google/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /continue with apple/i })).toBeDisabled();
    expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows validation errors for empty required fields', async () => {
    render(<RegisterForm />);
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText('First name is required')).toBeInTheDocument();
      expect(screen.getByText('Last name is required')).toBeInTheDocument();
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
      expect(screen.getByText('Please confirm your password')).toBeInTheDocument();
      expect(screen.getByText(/you must accept the terms of service/i)).toBeInTheDocument();
    });
  });

  it('shows error when passwords do not match', async () => {
    render(<RegisterForm />);

    await userEvent.type(screen.getByLabelText('Password'), 'SecurePass1');
    await userEvent.type(screen.getByLabelText('Confirm password'), 'Different1');
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
  });

  it('shows password strength indicator', async () => {
    render(<RegisterForm />);

    await userEvent.type(screen.getByLabelText('Password'), 'weak');
    expect(await screen.findByText(/weak/i)).toBeInTheDocument();

    await userEvent.clear(screen.getByLabelText('Password'));
    await userEvent.type(screen.getByLabelText('Password'), 'StrongPass1!');
    expect(await screen.findByText(/strong/i)).toBeInTheDocument();
  });

  it('submits registration and redirects to login on success', async () => {
    mockFetch({
      data: {
        identityId: 'id-1',
        email: 'user@example.com',
        status: 'ACTIVE',
      },
      meta: { requestId: 'req-1' },
    });

    render(<RegisterForm />);

    await userEvent.type(screen.getByLabelText('First name'), 'Jane');
    await userEvent.type(screen.getByLabelText('Last name'), 'Doe');
    await userEvent.type(screen.getByLabelText(/email address/i), 'user@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'SecurePass123!');
    await userEvent.type(screen.getByLabelText('Confirm password'), 'SecurePass123!');
    await userEvent.click(screen.getByRole('checkbox', { name: /terms of service/i }));
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/login?registered=true');
    });
  });

  it('disables submit while creating the account', async () => {
    let resolveRequest: (value: Response) => void = () => undefined;
    global.fetch = vi.fn().mockImplementation(
      () =>
        new Promise<Response>((resolve) => {
          resolveRequest = resolve;
        }),
    );

    render(<RegisterForm />);

    await userEvent.type(screen.getByLabelText('First name'), 'Jane');
    await userEvent.type(screen.getByLabelText('Last name'), 'Doe');
    await userEvent.type(screen.getByLabelText(/email address/i), 'user@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'SecurePass123!');
    await userEvent.type(screen.getByLabelText('Confirm password'), 'SecurePass123!');
    await userEvent.click(screen.getByRole('checkbox', { name: /terms of service/i }));
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));

    expect(screen.getByRole('button', { name: /creating account/i })).toBeDisabled();

    resolveRequest({
      ok: true,
      status: 201,
      statusText: 'Created',
      json: async () => ({
        data: { identityId: 'id-2', email: 'user@example.com', status: 'ACTIVE' },
        meta: { requestId: 'req-3' },
      }),
    } as Response);

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/login?registered=true');
    });
  });

  it('displays conflict message when email already exists', async () => {
    mockFetch(
      {
        error: {
          code: 'CONFLICT',
          message: 'Identity already exists',
          requestId: 'req-2',
        },
      },
      false,
      409,
    );

    render(<RegisterForm />);

    await userEvent.type(screen.getByLabelText('First name'), 'Jane');
    await userEvent.type(screen.getByLabelText('Last name'), 'Doe');
    await userEvent.type(screen.getByLabelText(/email address/i), 'existing@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'SecurePass123!');
    await userEvent.type(screen.getByLabelText('Confirm password'), 'SecurePass123!');
    await userEvent.click(screen.getByRole('checkbox', { name: /terms of service/i }));
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/an account with this email already exists/i)).toBeInTheDocument();
    });
  });
});
