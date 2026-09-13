import type { ApiClientError } from './api-client-error';
import type { ErrorCategory } from './categories';

const CATEGORY_MESSAGES: Readonly<Record<ErrorCategory, string>> = {
  validation: 'Please check the highlighted fields and try again.',
  authentication: 'Email or password is incorrect. Please try again.',
  authorization: 'You do not have permission to do that.',
  not_found: 'We could not find what you were looking for.',
  conflict: 'This action conflicts with existing data. Please review and try again.',
  rate_limit: 'Too many attempts. Please wait a moment and try again.',
  network: 'We could not load this page. Please try again.',
  server: 'Something went wrong. Please try again.',
  unknown: 'Something went wrong. Please try again.',
};

/**
 * Maps a normalized API error to a concise, non-technical user message.
 * Never returns stack traces, Prisma messages, or internal URLs.
 */
export function getUserFacingMessage(error: ApiClientError): string {
  if (error.category === 'validation' && error.message && !looksTechnical(error.message)) {
    return error.message;
  }
  return CATEGORY_MESSAGES[error.category];
}

function looksTechnical(message: string): boolean {
  return /prisma|econnrefused|axios|sql|stack|exception|127\.0\.0\.1|localhost:\d+/i.test(
    message,
  );
}
