import { AlertCircle } from 'lucide-react';
import {
  Alert,
  AlertContent,
  AlertDescription,
  AlertTitle,
} from '@novacommerce/ui/components/alert';
import { getAuthErrorCopy } from '@/lib/auth/errors';
import type { AuthErrorKind } from '@/lib/auth/types';

export interface AuthErrorProps {
  kind?: AuthErrorKind;
  message?: string;
  title?: string;
}

export function AuthError({ kind = 'unknown', message, title }: AuthErrorProps) {
  if (!message && !title && !kind) {
    return null;
  }

  const copy = getAuthErrorCopy(kind);

  return (
    <Alert variant="destructive" aria-live="assertive">
      <AlertCircle aria-hidden="true" />
      <AlertContent>
        <AlertTitle>{title ?? copy.title}</AlertTitle>
        <AlertDescription>
          <p>{message ?? copy.description}</p>
        </AlertDescription>
      </AlertContent>
    </Alert>
  );
}

/** @deprecated Use AuthError. Kept for existing form call sites during the transition. */
export function AuthErrorMessage({ message, kind }: { message?: string; kind?: AuthErrorKind }) {
  if (!message) {
    return null;
  }
  return <AuthError kind={kind} message={message} />;
}
