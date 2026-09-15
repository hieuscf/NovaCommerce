import { describe, expect, it } from 'vitest';
import {
  formatCardExpiration,
  formatCardNumber,
  formatOtpCode,
  formatOtpCountdown,
  isCardExpirationValid,
  isCardNumberComplete,
  isOtpComplete,
} from '../card-input';

describe('card input helpers', () => {
  it('groups card digits into fours', () => {
    expect(formatCardNumber('4111111111111111')).toBe('4111 1111 1111 1111');
    expect(formatCardNumber('4111-1111')).toBe('4111 1111');
  });

  it('formats expiration as MM / YY', () => {
    expect(formatCardExpiration('1229')).toBe('12 / 29');
    expect(formatCardExpiration('1')).toBe('1');
  });

  it('accepts a current or future expiration', () => {
    expect(isCardExpirationValid('12 / 29', new Date('2026-09-16'))).toBe(true);
    expect(isCardExpirationValid('08 / 26', new Date('2026-09-16'))).toBe(false);
    expect(isCardExpirationValid('13 / 29', new Date('2026-09-16'))).toBe(false);
  });

  it('keeps OTP to six digits', () => {
    expect(formatOtpCode('12a34567')).toBe('123456');
    expect(isOtpComplete('123456')).toBe(true);
    expect(isCardNumberComplete('4111111111111111')).toBe(true);
  });

  it('formats the resend countdown', () => {
    expect(formatOtpCountdown(45)).toBe('00:45');
    expect(formatOtpCountdown(0)).toBe('00:00');
  });
});
