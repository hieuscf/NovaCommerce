import type {
  EmailDeliveryResult,
  EmailMessage,
  IEmailChannel,
} from '../../application/contracts/i-email-channel';

export interface StubEmailChannelOptions {
  readonly shouldFail?: boolean;
  readonly failureMessage?: string;
}

export class StubEmailChannel implements IEmailChannel {
  readonly sentMessages: EmailMessage[] = [];

  constructor(private readonly options: StubEmailChannelOptions = {}) {}

  async send(message: EmailMessage): Promise<EmailDeliveryResult> {
    if (this.options.shouldFail) {
      return {
        success: false,
        errorMessage: this.options.failureMessage ?? 'Email delivery failed',
      };
    }

    this.sentMessages.push(message);
    return { success: true };
  }
}
