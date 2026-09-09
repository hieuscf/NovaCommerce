import { DomainError } from '@novacommerce/building-blocks';

export class PromotionDomainError extends DomainError {
  constructor(message: string, code: string) {
    super(message, code);
  }
}
