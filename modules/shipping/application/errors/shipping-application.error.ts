import { DomainError } from '@novacommerce/building-blocks';

export class ShippingApplicationError extends DomainError {
  constructor(message: string, code: string) {
    super(message, code);
  }
}
