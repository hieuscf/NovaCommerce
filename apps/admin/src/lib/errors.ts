import { getUserFacingMessage, isApiClientError, normalizeUnknownError } from '@novacommerce/frontend';

export function toFormError(error: unknown): string {
  if (isApiClientError(error)) {
    return getUserFacingMessage(error);
  }
  return getUserFacingMessage(normalizeUnknownError(error));
}
