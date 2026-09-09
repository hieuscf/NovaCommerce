import { DomainError } from '@novacommerce/building-blocks';

export class CmsDomainError extends DomainError {
  constructor(message: string, code: string) {
    super(message, code);
  }
}
