import { DomainError } from '@novacommerce/building-blocks';

export class SearchApplicationError extends DomainError {
  constructor(message: string, code: string) {
    super(message, code);
  }
}
