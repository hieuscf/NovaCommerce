import { DomainError } from '@novacommerce/building-blocks';

export class OrderDomainError extends DomainError {
  constructor(message: string, code: string) {
    super(message, code);
  }
}
