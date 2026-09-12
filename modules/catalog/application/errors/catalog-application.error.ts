import { DomainError } from '@novacommerce/building-blocks';

export class CatalogApplicationError extends DomainError {
  constructor(message: string, code: string) {
    super(message, code);
  }
}
