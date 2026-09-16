import type { AccountPaymentMethodViewModel } from '@/lib/view-models/account';
import type { SavedPaymentMethodDto } from './types';

export interface SavedPaymentMethodViewModel {
  readonly id: string;
  readonly brand: string;
  readonly brandLabel: string;
  readonly last4: string;
  readonly maskedLabel: string;
  readonly expLabel: string;
  readonly cardholderName: string;
  readonly isDefault: boolean;
}

function brandLabel(brand: string): string {
  switch (brand.toLowerCase()) {
    case 'visa':
      return 'Visa';
    case 'mastercard':
      return 'Mastercard';
    case 'amex':
      return 'American Express';
    case 'jcb':
      return 'JCB';
    default:
      return 'Card';
  }
}

function toAccountBrand(brand: string): AccountPaymentMethodViewModel['brand'] {
  switch (brand.toLowerCase()) {
    case 'visa':
      return 'visa';
    case 'mastercard':
      return 'mastercard';
    case 'amex':
      return 'amex';
    case 'jcb':
      return 'jcb';
    default:
      return 'card';
  }
}

export function formatCardExpiry(expMonth: number, expYear: number): string {
  const month = String(expMonth).padStart(2, '0');
  const year = String(expYear).slice(-2);
  return `${month}/${year}`;
}

/** Alloy account dashboard card row (brand / last4 / expires). */
export function mapSavedPaymentMethodToAccountViewModel(
  dto: SavedPaymentMethodDto,
): AccountPaymentMethodViewModel {
  return {
    id: dto.id,
    brand: toAccountBrand(dto.brand),
    last4: dto.last4,
    expires: formatCardExpiry(dto.expMonth, dto.expYear),
    isDefault: dto.isDefault,
  };
}

export function mapSavedPaymentMethodToViewModel(
  dto: SavedPaymentMethodDto,
): SavedPaymentMethodViewModel {
  const label = brandLabel(dto.brand);
  const expLabel = formatCardExpiry(dto.expMonth, dto.expYear);
  return {
    id: dto.id,
    brand: dto.brand,
    brandLabel: label,
    last4: dto.last4,
    maskedLabel: `${label} •••• ${dto.last4}`,
    expLabel,
    cardholderName: dto.cardholderName,
    isDefault: dto.isDefault,
  };
}
