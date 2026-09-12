import { describe, expect, it } from 'vitest';
import { StubEmailChannel } from './stub-email-channel';

describe('StubEmailChannel', () => {
  it('records successful delivery', async () => {
    const channel = new StubEmailChannel();
    const result = await channel.send({
      to: 'user@example.com',
      subject: 'Hello',
      body: 'World',
    });

    expect(result.success).toBe(true);
    expect(channel.sentMessages).toHaveLength(1);
  });

  it('returns failure when configured', async () => {
    const channel = new StubEmailChannel({ shouldFail: true, failureMessage: 'SMTP down' });
    const result = await channel.send({
      to: 'user@example.com',
      subject: 'Hello',
      body: 'World',
    });

    expect(result.success).toBe(false);
    expect(result.errorMessage).toBe('SMTP down');
  });
});
