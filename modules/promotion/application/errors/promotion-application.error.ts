import { DomainError } from '@novacommerce/building-blocks';

export class PromotionApplicationError extends DomainError {
  constructor(message: string, code: string) {
    super(message, code);
  }
}
