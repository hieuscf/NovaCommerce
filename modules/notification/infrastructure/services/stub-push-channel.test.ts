import { describe, expect, it } from 'vitest';
import { StubPushChannel } from './stub-push-channel';

describe('StubPushChannel', () => {
  it('records successful delivery', async () => {
    const channel = new StubPushChannel();
    const result = await channel.send({
      deviceToken: 'customer:1',
      title: 'Hello',
      body: 'World',
    });

    expect(result.success).toBe(true);
    expect(channel.sentMessages).toHaveLength(1);
  });

  it('returns failure when configured', async () => {
    const channel = new StubPushChannel({ shouldFail: true });
    const result = await channel.send({
      deviceToken: 'customer:1',
      title: 'Hello',
      body: 'World',
    });

    expect(result.success).toBe(false);
  });
});
