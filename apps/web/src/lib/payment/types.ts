export interface SavedPaymentMethodDto {
  readonly id: string;
  readonly brand: string;
  readonly last4: string;
  readonly expMonth: number;
  readonly expYear: number;
  readonly cardholderName: string;
  readonly isDefault: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/** Save-card payload. CVV/CVC must never be included (ADR-006). */
export interface AddSavedPaymentMethodRequest {
  readonly cardNumber: string;
  readonly cardholderName: string;
  readonly expMonth: number;
  readonly expYear: number;
  readonly isDefault?: boolean;
}

export interface IPaymentMethodsClient {
  list(): Promise<SavedPaymentMethodDto[]>;
  add(body: AddSavedPaymentMethodRequest): Promise<SavedPaymentMethodDto>;
  remove(paymentMethodId: string): Promise<void>;
  setDefault(paymentMethodId: string): Promise<SavedPaymentMethodDto>;
}
