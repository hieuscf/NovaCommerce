import type {
  IPushChannel,
  PushDeliveryResult,
  PushMessage,
} from '../../application/contracts/i-push-channel';

export interface StubPushChannelOptions {
  readonly shouldFail?: boolean;
  readonly failureMessage?: string;
}

export class StubPushChannel implements IPushChannel {
  readonly sentMessages: PushMessage[] = [];

  constructor(private readonly options: StubPushChannelOptions = {}) {}

  async send(message: PushMessage): Promise<PushDeliveryResult> {
    if (this.options.shouldFail) {
      return {
        success: false,
        errorMessage: this.options.failureMessage ?? 'Push delivery failed',
      };
    }

    this.sentMessages.push(message);
    return { success: true };
  }
}
