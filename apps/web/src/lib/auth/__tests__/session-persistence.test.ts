import { beforeEach, describe, expect, it, vi } from 'vitest';
import { clearPersistedSession, persistSession, readPersistedSession } from '../session-persistence';

describe('session persistence client', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  it('posts the refresh token to the same-origin BFF without exposing it to the snapshot', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 204 } as Response);

    await persistSession(
      {
        accessToken: 'access-token',
        refreshToken: 'refresh-token-value',
        tokenType: 'Bearer',
        expiresIn: 900,
      },
      { rememberMe: true },
    );

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/auth/session',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
      }),
    );
    const init = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0]?.[1] as RequestInit;
    expect(init.body).toContain('refresh-token-value');
    expect(init.body).toContain('"rememberMe":true');
  });

  it('reads an access session and ignores unauthorized restore', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { accessToken: 'restored', tokenType: 'Bearer', expiresIn: 900 },
        }),
      } as Response)
      .mockResolvedValueOnce({ ok: false, status: 401 } as Response);

    await expect(readPersistedSession()).resolves.toEqual({
      accessToken: 'restored',
      tokenType: 'Bearer',
      expiresIn: 900,
    });
    await expect(readPersistedSession()).resolves.toBeNull();
  });

  it('clears the persisted session on logout', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 204 } as Response);
    await clearPersistedSession();
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/auth/session',
      expect.objectContaining({ method: 'DELETE', credentials: 'include' }),
    );
  });
});
