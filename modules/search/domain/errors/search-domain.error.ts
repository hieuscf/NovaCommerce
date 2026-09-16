import { DomainError } from '@novacommerce/building-blocks';

export class SearchDomainError extends DomainError {
  constructor(message: string, code: string) {
    super(message, code);
  }
}
