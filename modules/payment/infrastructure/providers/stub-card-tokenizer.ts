import { createHash, randomUUID } from 'node:crypto';
import type { CardTokenizationResult, ICardTokenizer } from '../../application/contracts/card-tokenizer.contract';
import { PaymentDomainError } from '../../domain/errors/payment-domain.error';

function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

function detectBrand(pan: string): string {
  if (pan.startsWith('4')) return 'visa';
  if (/^5[1-5]/.test(pan) || /^2[2-7]/.test(pan)) return 'mastercard';
  if (pan.startsWith('34') || pan.startsWith('37')) return 'amex';
  if (pan.startsWith('35')) return 'jcb';
  return 'card';
}

/**
 * Development tokenizer. Derives brand/last4, returns an opaque token, and
 * does not persist the PAN. CVV must never be passed here (ADR-006).
 */
export class StubCardTokenizer implements ICardTokenizer {
  tokenize(input: {
    readonly cardNumber: string;
    readonly expMonth: number;
    readonly expYear: number;
    readonly cardholderName: string;
  }): CardTokenizationResult {
    const pan = digitsOnly(input.cardNumber);
    if (pan.length < 13 || pan.length > 19) {
      throw new PaymentDomainError('Enter a valid card number', 'INVALID_CARD_NUMBER');
    }
    if (!input.cardholderName?.trim()) {
      throw new PaymentDomainError('Cardholder name is required', 'INVALID_CARDHOLDER_NAME');
    }

    const last4 = pan.slice(-4);
    const brand = detectBrand(pan);
    const digest = createHash('sha256').update(`${pan}:${input.expMonth}:${input.expYear}`).digest('hex').slice(0, 24);
    // PAN is not returned or stored — only the opaque token leaves this function.
    return {
      provider: 'stub',
      providerToken: `stub_${digest}_${randomUUID().slice(0, 8)}`,
      brand,
      last4,
    };
  }
}
