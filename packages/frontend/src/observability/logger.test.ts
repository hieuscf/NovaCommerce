import { describe, expect, it, vi } from 'vitest';
import { redactContext, reportFrontendEvent, setFrontendLogReporter } from './logger';

describe('frontend logger', () => {
  it('redacts credentials and tokens', () => {
    expect(
      redactContext({
        email: 'user@example.com',
        password: 'secret',
        accessToken: 'abc',
        refreshToken: 'def',
      }),
    ).toEqual({
      email: 'user@example.com',
      password: '[redacted]',
      accessToken: '[redacted]',
      refreshToken: '[redacted]',
    });
  });

  it('forwards redacted events to the reporter', () => {
    const reporter = vi.fn();
    setFrontendLogReporter(reporter);
    reportFrontendEvent({
      level: 'error',
      event: 'api.failed',
      context: { token: 'abc' },
    });
    expect(reporter).toHaveBeenCalledWith({
      level: 'error',
      event: 'api.failed',
      context: { token: '[redacted]' },
    });
    setFrontendLogReporter(null);
  });
});
