import { DomainError } from '@novacommerce/building-blocks';

export class InventoryDomainError extends DomainError {
  constructor(message: string, code: string) {
    super(message, code);
  }
}
