const CARD_NUMBER_MIN = 13;
const CARD_NUMBER_MAX = 19;

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

export function formatCardNumber(value: string): string {
  return digitsOnly(value)
    .slice(0, CARD_NUMBER_MAX)
    .replace(/(\d{4})(?=\d)/g, '$1 ')
    .trim();
}

export function formatCardExpiration(value: string): string {
  const digits = digitsOnly(value).slice(0, 4);
  if (digits.length <= 2) {
    return digits;
  }
  return `${digits.slice(0, 2)} / ${digits.slice(2)}`;
}

export function formatOtpCode(value: string): string {
  return digitsOnly(value).slice(0, 6);
}

export function isCardNumberComplete(value: string): boolean {
  const digits = digitsOnly(value).length;
  return digits >= CARD_NUMBER_MIN && digits <= CARD_NUMBER_MAX;
}

export function parseCardExpiration(value: string): { month: number; year: number } | null {
  const digits = digitsOnly(value);
  if (digits.length !== 4) {
    return null;
  }
  const month = Number(digits.slice(0, 2));
  const year = 2000 + Number(digits.slice(2));
  if (month < 1 || month > 12) {
    return null;
  }
  return { month, year };
}

export function isCardExpirationValid(value: string, now = new Date()): boolean {
  const parsed = parseCardExpiration(value);
  if (!parsed) {
    return false;
  }
  const currentMonthIndex = now.getFullYear() * 12 + now.getMonth();
  const expirationMonthIndex = parsed.year * 12 + (parsed.month - 1);
  return expirationMonthIndex >= currentMonthIndex;
}

export function isCardCvvComplete(value: string): boolean {
  const digits = digitsOnly(value).length;
  return digits === 3 || digits === 4;
}

export function isOtpComplete(value: string): boolean {
  return digitsOnly(value).length === 6;
}

export function formatOtpCountdown(seconds: number): string {
  const safe = Math.max(0, seconds);
  const minutes = Math.floor(safe / 60);
  const remainder = safe % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
}
