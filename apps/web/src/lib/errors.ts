import { getUserFacingMessage, isApiClientError } from '@novacommerce/frontend';

export function toFormError(error: unknown): string {
  if (isApiClientError(error)) {
    return getUserFacingMessage(error);
  }
  return 'Something went wrong. Please try again.';
}
