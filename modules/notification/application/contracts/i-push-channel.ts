export interface PushMessage {
  readonly deviceToken: string;
  readonly title: string;
  readonly body: string;
}

export interface PushDeliveryResult {
  readonly success: boolean;
  readonly errorMessage?: string;
}

export interface IPushChannel {
  send(message: PushMessage): Promise<PushDeliveryResult>;
}
