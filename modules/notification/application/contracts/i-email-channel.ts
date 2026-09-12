export interface EmailMessage {
  readonly to: string;
  readonly subject: string;
  readonly body: string;
}

export interface EmailDeliveryResult {
  readonly success: boolean;
  readonly errorMessage?: string;
}

export interface IEmailChannel {
  send(message: EmailMessage): Promise<EmailDeliveryResult>;
}
