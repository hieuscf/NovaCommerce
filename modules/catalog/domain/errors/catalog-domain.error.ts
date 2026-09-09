import { DomainError } from '@novacommerce/building-blocks';

export class CatalogDomainError extends DomainError {
  constructor(message: string, code: string) {
    super(message, code);
  }
}
