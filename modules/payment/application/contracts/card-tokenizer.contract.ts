/**
 * Tokenizes a card PAN into an opaque provider token.
 * Implementations must discard the PAN and never accept or return CVV (ADR-006).
 */
export interface CardTokenizationResult {
  readonly provider: string;
  readonly providerToken: string;
  readonly brand: string;
  readonly last4: string;
}

export interface ICardTokenizer {
  tokenize(input: {
    readonly cardNumber: string;
    readonly expMonth: number;
    readonly expYear: number;
    readonly cardholderName: string;
  }): CardTokenizationResult;
}
