export interface DeliveryRetryPolicyOptions {
  readonly maxAttempts?: number;
  readonly baseDelayMs?: number;
}

export class DeliveryRetryPolicy {
  private readonly maxAttempts: number;
  private readonly baseDelayMs: number;

  constructor(options: DeliveryRetryPolicyOptions = {}) {
    this.maxAttempts = options.maxAttempts ?? 3;
    this.baseDelayMs = options.baseDelayMs ?? 100;
  }

  getMaxAttempts(): number {
    return this.maxAttempts;
  }

  getDelayMs(attempt: number): number {
    return this.baseDelayMs * 2 ** Math.max(0, attempt - 1);
  }

  async waitBeforeRetry(attempt: number): Promise<void> {
    const delayMs = this.getDelayMs(attempt);
    if (delayMs <= 0) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
}
