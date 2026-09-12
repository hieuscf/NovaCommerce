import { DomainError } from '@novacommerce/building-blocks';

export class InventoryApplicationError extends DomainError {
  constructor(message: string, code: string) {
    super(message, code);
  }
}
