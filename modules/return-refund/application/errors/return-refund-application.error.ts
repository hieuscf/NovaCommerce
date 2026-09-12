import { DomainError } from '@novacommerce/building-blocks';

export class ReturnRefundApplicationError extends DomainError {
  constructor(message: string, code: string) {
    super(message, code);
  }
}
