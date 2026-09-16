export interface SavedPaymentMethodResponseDto {
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
